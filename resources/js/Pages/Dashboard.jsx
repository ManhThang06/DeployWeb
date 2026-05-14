import BootstrapLayout from '@/Layouts/BootstrapLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useCallback, useRef } from 'react';
import useDebounce from '@/Hooks/useDebounce';
import ConfirmationModal from '@/Components/ConfirmationModal';
import LabelManager from '@/Components/LabelManager';
import NotePasswordModal from '@/Components/NotePasswordModal';
import NoteShareModal from '@/Components/NoteShareModal';
import axios from 'axios';
import useSync from '@/Hooks/useSync';
import { db } from '@/db';
import { confirmDestructive, confirmAction, notifyError } from '@/Utils/sweetalert';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Users, Grid, List, Tag, Pin, PinOff, Trash2, Shield, Calendar, Share2, MoreVertical, X, CheckCircle2, CloudOff, Loader2 } from 'lucide-react';

export default function Dashboard({ notes: initialNotes, labels, allLabels: propAllLabels, filters, auth, openedNote, errors }) {
    const [notes, setNotes] = useState(initialNotes);
    const [viewMode, setViewMode] = useState('grid');
    const [search, setSearch] = useState(filters.search || '');
    const debouncedSearch = useDebounce(search, 300);

    const [selectedNote, setSelectedNote] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showLabelManager, setShowLabelManager] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null); 
    
    const [noteToDelete, setNoteToDelete] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [quickLabelName, setQuickLabelName] = useState('');
    const [allLabels, setAllLabels] = useState(propAllLabels || labels);

    const [noteForm, setNoteForm] = useState({ title: '', content: '' });
    const debouncedNoteForm = useDebounce(noteForm, 300);
    const [isSaving, setIsSaving] = useState(false);
    const savingCount = useRef(0);
    const lastSavedContent = useRef({ title: '', content: '' });
    const noteChannelsRef = useRef({});
    const [echoReady, setEchoReady] = useState(!!window.Echo);
    
    const [showPasswordSettings, setShowPasswordSettings] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ password: '', password_confirmation: '', current_password: '' });

    const { isOnline, isSyncing, syncData, saveNote } = useSync();

    // Sync initial notes from props
    useEffect(() => {
        setNotes(prev => {
            const tempNotes = prev.filter(n => String(n.id).startsWith('temp_'));
            const serverNotes = initialNotes.map(n => ({
                ...n,
                server_id: n.id,
                sync_status: 'synced',
                images: n.images || [],
                labels: n.labels || [],
            }));
            return [...serverNotes, ...tempNotes];
        });

        if (selectedNote) {
            const updated = initialNotes.find(n => n.id === (selectedNote.server_id || selectedNote.id));
            if (updated) setSelectedNote(prev => ({ ...prev, ...updated, images: updated.images || [], labels: updated.labels || [] }));
        }

        setAllLabels(propAllLabels || labels);
    }, [initialNotes, labels, propAllLabels]);

    // Auto-open note if requested
    useEffect(() => {
        if (openedNote && !showModal && !showPasswordModal && (!selectedNote || selectedNote.id !== openedNote.id)) {
            openNote(openedNote);
        }
    }, [openedNote?.id]);

    const handleFilter = useCallback((newSearch, newLabelIds) => {
        router.get(route('dashboard'), { 
            search: newSearch, 
            label_ids: newLabelIds && newLabelIds.length > 0 ? newLabelIds.join(',') : undefined
        }, { preserveState: true, replace: true, preserveScroll: true });
    }, []);

    const selectedLabelIds = filters.label_ids 
        ? (Array.isArray(filters.label_ids) ? filters.label_ids.map(id => String(id)) : String(filters.label_ids).split(',').map(id => String(id)))
        : [];

    const toggleLabelFilter = (labelId) => {
        let newIds;
        if (selectedLabelIds.includes(String(labelId))) {
            newIds = selectedLabelIds.filter(id => id !== String(labelId));
        } else {
            newIds = [...selectedLabelIds, String(labelId)];
        }
        handleFilter(search, newIds);
    };

    useEffect(() => {
        if (debouncedSearch !== (filters.search || '')) {
            handleFilter(debouncedSearch, selectedLabelIds);
        }
    }, [debouncedSearch]);

    useEffect(() => {
        if (!selectedNote) return;
        const titleChanged = (debouncedNoteForm.title || '') !== lastSavedContent.current.title;
        const contentChanged = (debouncedNoteForm.content || '') !== lastSavedContent.current.content;
        if (titleChanged || contentChanged) {
            handleAutoSave(selectedNote, debouncedNoteForm);
        }
    }, [debouncedNoteForm]);

    // Detect khi window.Echo được khởi tạo xong (async)
    useEffect(() => {
        if (window.Echo) { setEchoReady(true); return; }
        const timer = setInterval(() => {
            if (window.Echo) { setEchoReady(true); clearInterval(timer); }
        }, 300);
        return () => clearInterval(timer);
    }, []);

    // REAL-TIME (GLOBAL): Cập nhật card notes trong danh sách ngay kể cả khi chưa mở ghi chú
    useEffect(() => {
        if (!echoReady || !window.Echo) return;
        const subscribed = noteChannelsRef.current;
        const activeIds = new Set();

        notes.forEach(note => {
            const id = String(note.server_id || note.id);
            if (id.startsWith('temp_')) return;
            activeIds.add(id);
            if (subscribed[id]) return; // đã subscribe rồi

            const ch = window.Echo.private(`note.${id}`);
            // Cập nhật for Echo
            const handler = (e) => {
                if (e.userId === auth?.user?.id) return;
                const myLabels = (e.labels ?? []).filter(l => l.user_id === auth.user.id);
                setNotes(prev => prev.map(n =>
                    (String(n.id) === String(e.noteId) || String(n.server_id) === String(e.noteId))
                        ? { ...n, title: e.title, content: e.content, images: e.images ?? n.images, labels: myLabels }
                        : n
                ));

                // Cập nhật danh sách nhãn có sẵn
                if (e.labels) {
                    setAllLabels(prev => {
                        const existingIds = new Set(prev.map(l => l.id));
                        const toAdd = myLabels.filter(l => !existingIds.has(l.id));
                        if (toAdd.length === 0) return prev;
                        return [...prev, ...toAdd];
                    });
                }
            };
            ch.listen('.note.updated', handler);
            subscribed[id] = { ch, handler };
        });

        // Hủy subscribe các note không còn trong danh sách
        Object.keys(subscribed).forEach(id => {
            if (!activeIds.has(id)) {
                subscribed[id].ch.stopListening('.note.updated');
                delete subscribed[id];
            }
        });

        return () => {
            Object.values(noteChannelsRef.current).forEach(({ ch }) => ch?.stopListening('.note.updated'));
            noteChannelsRef.current = {};
        };
    }, [notes.map(n => String(n.server_id || n.id)).join(','), echoReady]);

    // REAL-TIME (MODAL): Cập nhật form và selectedNote khi ghi chú đang được mở
    useEffect(() => {
        if (!showModal || !selectedNote) return;

        const noteId = selectedNote.server_id || selectedNote.id;
        if (!noteId || String(noteId).startsWith('temp_')) return;

        const channel = window.Echo?.private(`note.${noteId}`);
        if (!channel) return;

        channel.listen('.note.updated', (e) => {
            if (e.userId === auth?.user?.id) return;

            // Cập nhật "nội dung đã xác nhận" để tránh auto-save ghi đè
            lastSavedContent.current = { title: e.title, content: e.content };

            // Cập nhật form ngay lập tức kể cả khi đang focus
            setNoteForm(prev => ({ ...prev, title: e.title ?? prev.title, content: e.content ?? prev.content }));

            // Cập nhật selectedNote (setNotes đã được global listener xử lý)
            const myLabels = (e.labels ?? []).filter(l => l.user_id === auth.user.id);
            const updatedData = { title: e.title, content: e.content, images: e.images ?? [], labels: myLabels };
            setSelectedNote(prev =>
                prev && (prev.id === e.noteId || prev.server_id === e.noteId)
                    ? { ...prev, ...updatedData }
                    : prev
            );

            // Cập nhật danh sách nhãn có sẵn nếu có nhãn mới dành cho user hiện tại
            if (e.labels) {
                setAllLabels(prev => {
                    const existingIds = new Set(prev.map(l => l.id));
                    const toAdd = myLabels.filter(l => !existingIds.has(l.id));
                    if (toAdd.length === 0) return prev;
                    return [...prev, ...toAdd];
                });
            }
        });

        return () => channel.stopListening('.note.updated');
    }, [showModal, selectedNote?.id, selectedNote?.server_id]);

    const handleAutoSave = async (note, data) => {
        savingCount.current++;
        setIsSaving(true);
        try {
            lastSavedContent.current = { title: data.title || '', content: data.content || '' };
            const finalData = { ...data };
            const hasText = data.title?.trim() || data.content?.trim();
            const hasImages = note.images && note.images.length > 0;

            if (!hasText && hasImages && !data.title?.trim()) {
                finalData.title = 'Không tiêu đề';
            }

            let updatedNote;
            if (!note.server_id && String(note.id).startsWith('temp_')) {
                if (!hasText && !hasImages) {
                    setIsSaving(false);
                    return; 
                }
                const res = await axios.post(route('notes.store'), finalData);
                updatedNote = { ...res.data, server_id: res.data.id, sync_status: 'synced', images: note.images || [], labels: res.data.labels || [] };
            } else {
                const result = await saveNote(finalData, note.server_id || note.id);
                updatedNote = { ...result, images: result.images || note.images || [], labels: result.labels || note.labels || [] };
            }
            setNotes(prev => prev.map(n => (n.id === note.id || n.server_id === (note.server_id || note.id)) ? { ...n, ...updatedNote } : n));
            if (finalData.title === 'Không tiêu đề' && data.title !== 'Không tiêu đề') {
                setNoteForm(prev => ({ ...prev, title: 'Không tiêu đề' }));
            }
            setSelectedNote(prev => ({ ...prev, ...updatedNote }));
        } catch (error) {
            console.error('Auto-save failed', error);
        } finally {
            savingCount.current--;
            if (savingCount.current <= 0) setIsSaving(false);
        }
    };

    const openNote = (note = null) => {
        if (!note) {
            handleCreateNewNote();
            return;
        }
        lastSavedContent.current = { title: note.title || '', content: note.content || '' };
        if (note.has_password) {
            setPendingAction({ type: 'open', note });
            setShowPasswordModal(true);
            return;
        }
        setSelectedNote(note);
        setNoteForm({ title: note.title || '', content: note.content || '' });
        setShowModal(true);
        setShowPasswordSettings(false);
    };

    const closeNote = () => {
        if (selectedNote) {
            const isEmpty = !noteForm.title?.trim() && !noteForm.content?.trim() && (!selectedNote.images || selectedNote.images.length === 0);
            if (isEmpty) {
                if (!String(selectedNote.id).startsWith('temp_')) {
                    const id = selectedNote.server_id || selectedNote.id;
                    router.delete(route('notes.destroy', id), {
                        onSuccess: () => setNotes(prev => prev.filter(n => n.id !== selectedNote.id && n.server_id !== id))
                    });
                } else {
                    setNotes(prev => prev.filter(n => n.id !== selectedNote.id));
                }
            }
        }
        setShowModal(false);
        setSelectedNote(null);
        const params = new URLSearchParams(window.location.search);
        if (filters.from === 'shared' || params.get('from') === 'shared') {
            router.get(route('notes.shared-with-me'));
        } else if (params.get('open')) {
            router.replace(route('dashboard'));
        }
    };

    const handleCreateNewNote = () => {
        const tempNote = {
            id: `temp_${Date.now()}`,
            server_id: null,
            title: '',
            content: '',
            images: [],
            labels: [],
            is_pinned: false,
            has_password: false,
            user_id: auth.user.id,
            updated_at: new Date().toISOString(),
            sync_status: 'pending_create',
        };
        setNotes(prev => [tempNote, ...prev]);
        setSelectedNote(tempNote);
        setNoteForm({ title: '', content: '' });
        setShowModal(true);
    };

    const confirmDelete = (note) => {
        if (note.has_password) {
            setPendingAction({ type: 'delete', note });
            setShowPasswordModal(true);
            return;
        }
        setNoteToDelete(note);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!noteToDelete.server_id && String(noteToDelete.id).startsWith('temp_')) {
            setNotes(prev => prev.filter(n => n.id !== noteToDelete.id));
            setShowDeleteModal(false);
            setShowModal(false);
            return;
        }
        const id = noteToDelete.server_id || noteToDelete.id;
        router.delete(route('notes.destroy', id), {
            onSuccess: () => {
                setNotes(prev => prev.filter(n => n.id !== noteToDelete.id && n.server_id !== id));
                setShowDeleteModal(false);
                setShowModal(false);
            }
        });
    };

    const togglePin = (note) => {
        router.post(route('notes.pin', note.id), {}, { preserveScroll: true });
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        router.post(route('notes.set-password', selectedNote.id), passwordForm, {
            onSuccess: () => {
                setPasswordForm({ password: '', password_confirmation: '', current_password: '' });
                setShowPasswordSettings(false);
            }
        });
    };

    const handlePasswordSuccess = (password) => {
        const action = pendingAction;
        setPendingAction(null);
        setShowPasswordModal(false);
        if (action?.type === 'open' && action.note) {
            const note = action.note;
            lastSavedContent.current = { title: note.title || '', content: note.content || '' };
            setSelectedNote({ ...note, unlockedPassword: password });
            setNoteForm({ title: note.title || '', content: note.content || '' });
            setShowModal(true);
            setShowPasswordSettings(false);
        } else if (action?.type === 'delete' && action.note) {
            setNoteToDelete(action.note);
            setShowDeleteModal(true);
        }
    };

    const disablePassword = () => {
        if (!passwordForm.current_password.trim()) {
            notifyError('Thiếu thông tin', 'Vui lòng nhập mật khẩu hiện tại để xác nhận tắt bảo mật.');
            return;
        }
        confirmAction('Tắt mật khẩu?', 'Bạn có chắc chắn muốn tắt mật khẩu bảo vệ cho ghi chú này?').then((result) => {
            if (result.isConfirmed) {
                router.post(route('notes.set-password', selectedNote.id), { disable: true, current_password: passwordForm.current_password }, {
                    onSuccess: () => {
                        setPasswordForm({ password: '', password_confirmation: '', current_password: '' });
                        setShowPasswordSettings(false);
                    },
                    onError: () => notifyError('Mật khẩu không đúng', 'Vui lòng kiểm tra lại mật khẩu hiện tại và thử lại.')
                });
            }
        });
    };

    const handleImageUpload = async (e, replaceId = null) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);

        if (replaceId) {
            router.post(route('notes.image.replace', replaceId), formData, { onSuccess: () => router.reload({ only: ['notes'] }) });
            return;
        }

        let noteId = selectedNote.server_id || selectedNote.id;
        if (!selectedNote.server_id && String(selectedNote.id).startsWith('temp_')) {
            try {
                setIsSaving(true);
                const autoTitle = (!noteForm.title || noteForm.title.trim() === '') ? file.name.replace(/\.[^/.]+$/, '') : noteForm.title;
                const res = await axios.post(route('notes.store'), { title: autoTitle, content: noteForm.content || '' });
                noteId = res.data.id;
                const updatedNote = { ...res.data, server_id: res.data.id, sync_status: 'synced', images: [], labels: res.data.labels || [] };
                setSelectedNote(updatedNote);
                setNoteForm(prev => ({ ...prev, title: autoTitle }));
                setNotes(prev => prev.map(n => n.id === selectedNote.id ? updatedNote : n));
            } catch (err) { console.error(err); setIsSaving(false); return; } finally { setIsSaving(false); }
        }

        router.post(route('notes.image', noteId), formData, { onSuccess: () => router.reload({ only: ['notes'] }) });
    };

    const handleDeleteImage = (imgId) => {
        confirmDestructive('Xóa ảnh?', 'Bạn có chắc chắn muốn xóa ảnh này khỏi ghi chú?').then((result) => {
            if (result.isConfirmed) {
                router.delete(route('notes.image.destroy', imgId), { preserveScroll: true, onSuccess: () => router.reload({ only: ['notes'] }) });
            }
        });
    };

    const handleLabelSync = (label) => {
        const noteId = selectedNote.server_id || selectedNote.id;
        if (String(noteId).startsWith('temp_')) return;
        const currentLabels = selectedNote.labels.map(l => l.id);
        const newLabelIds = currentLabels.includes(label.id) ? currentLabels.filter(id => id !== label.id) : [...currentLabels, label.id];
        router.post(route('notes.labels', noteId), { label_ids: newLabelIds }, { preserveScroll: true, onSuccess: () => router.reload({ only: ['notes', 'labels', 'allLabels'] }) });
    };

    const handleQuickAddLabel = (e) => {
        e.preventDefault();
        if (!quickLabelName.trim()) return;
        const noteId = selectedNote.server_id || selectedNote.id;
        if (String(noteId).startsWith('temp_')) return;
        router.post(route('notes.labels.add', noteId), { name: quickLabelName }, { preserveScroll: true, onSuccess: () => { setQuickLabelName(''); router.reload({ only: ['notes', 'labels', 'allLabels'] }); } });
    };

    return (
        <BootstrapLayout>
            <Head title="Quản lý ghi chú" />

            <AnimatePresence>
                {!isOnline && (
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="fixed top-24 left-1/2 -translate-x-1/2 z-[60]">
                        <div className="bg-rose-500 text-white px-6 py-2 rounded-2xl shadow-xl flex items-center gap-2 font-bold text-sm">
                            <CloudOff size={16} /> Đang ngoại tuyến
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {isSyncing && (
                <div className="fixed bottom-8 right-8 z-50">
                    <div className="bg-emerald-800 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm border border-emerald-700/50">
                        <Loader2 size={18} className="animate-spin" /> Đồng bộ hóa...
                    </div>
                </div>
            )}

            <div className="py-6 space-y-10">
                {/* Search & Actions Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="w-full md:max-w-xl relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-700 transition-colors">
                            <Search size={20} />
                        </div>
                        <input 
                            type="text" 
                            className="w-full pl-14 pr-6 py-4 rounded-3xl font-medium placeholder:text-slate-400 focus:ring-4 transition-all shadow-sm" 
                            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)', '--tw-ring-color': 'var(--note-primary-color)' }}
                            placeholder="Tìm kiếm nhanh ghi chú..." 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)} 
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Link href={route('notes.shared-with-me')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 glass-card-note text-slate-500 font-bold hover:text-emerald-500 transition-all shadow-sm no-underline rounded-3xl" style={{ backgroundColor: 'var(--bg-card)' }}>
                            <Users size={18} /> Chia sẻ
                        </Link>
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-emerald-800 text-white rounded-3xl font-bold shadow-xl shadow-emerald-800/20 hover:bg-emerald-900 transition-all border-0" 
                            onClick={() => openNote()}
                        >
                            <Plus size={20} strokeWidth={3} /> Ghi chú mới
                        </motion.button>
                    </div>
                </div>

                {/* Filters & View Controls */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <button 
                            className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all border-0 ${selectedLabelIds.length === 0 ? 'bg-emerald-800 text-white shadow-lg shadow-emerald-800/10' : 'text-slate-500 hover:bg-emerald-800/10'}`} 
                            style={{ backgroundColor: selectedLabelIds.length === 0 ? '' : 'var(--bg-card)', border: selectedLabelIds.length === 0 ? '' : '1px solid var(--border-color)' }}
                            onClick={() => handleFilter(search, [])}
                        >
                            Tất cả
                        </button>
                        {labels.map(label => (
                            <button 
                                key={label.id} 
                                className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all border-0 flex items-center gap-2 ${selectedLabelIds.includes(String(label.id)) ? 'bg-emerald-800 text-white shadow-lg shadow-emerald-800/10' : 'text-slate-500 hover:bg-emerald-800/10'}`} 
                                style={{ backgroundColor: selectedLabelIds.includes(String(label.id)) ? '' : 'var(--bg-card)', border: selectedLabelIds.includes(String(label.id)) ? '' : '1px solid var(--border-color)' }}
                                onClick={() => toggleLabelFilter(label.id)}
                            >
                                <Tag size={14} /> {label.name}
                            </button>
                        ))}
                        <button 
                            className="w-10 h-10 rounded-2xl text-slate-400 hover:text-emerald-800 flex items-center justify-center transition-all border-0 ml-2" 
                            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                            onClick={() => setShowLabelManager(true)}
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    <div className="bg-slate-200/50 p-1 rounded-2xl flex items-center shadow-inner">
                        <button 
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border-0 ${viewMode === 'grid' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-400 bg-transparent'}`} 
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid size={18} />
                        </button>
                        <button 
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border-0 ${viewMode === 'list' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-400 bg-transparent'}`} 
                            onClick={() => setViewMode('list')}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>

                {/* Notes Display Area */}
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'flex flex-column gap-4'}>
                    <AnimatePresence mode="popLayout">
                        {notes.map(note => (
                            <motion.div 
                                key={note.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                onClick={() => openNote(note)}
                                className={`group relative glass-card-note rounded-[2rem] p-6 cursor-pointer transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-900/10 ${note.is_pinned ? 'ring-2 ring-emerald-800/20' : ''}`}
                            >
                                <div className="flex flex-column h-full">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="font-bold line-clamp-1 group-hover:opacity-80 transition-opacity" style={{ color: 'var(--note-text-color)', fontSize: 'var(--note-fs-card-title)' }}>
                                                {note.title || 'Ghi chú mới'}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1 opacity-50 font-bold text-[10px] uppercase tracking-wider text-slate-500">
                                                <Calendar size={12} /> {new Date(note.updated_at).toLocaleDateString('vi-VN')}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {note.has_password && <Shield size={16} className="text-emerald-600" />}
                                            {note.shared_with?.length > 0 && <Users size={16} className="text-blue-500" />}
                                            <button 
                                                className={`p-1.5 rounded-xl transition-all border-0 bg-transparent ${note.is_pinned ? 'text-emerald-800 bg-emerald-50' : 'text-slate-300 hover:text-emerald-800'}`} 
                                                onClick={(e) => { e.stopPropagation(); togglePin(note); }}
                                            >
                                                {note.is_pinned ? <Pin size={18} fill="currentColor" /> : <Pin size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-grow">
                                        <p className="font-medium line-clamp-4 leading-relaxed opacity-70" style={{ color: 'var(--note-text-color)', fontSize: 'var(--note-fs-card-content)' }}>
                                            {note.has_password ? 'Nội dung đã được khóa bảo mật...' : (note.content || 'Chưa có nội dung...')}
                                        </p>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <div className="flex flex-wrap gap-1">
                                            {note.labels.slice(0, 2).map(l => (
                                                <span key={l.id} className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-tight">#{l.name}</span>
                                            ))}
                                            {note.labels.length > 2 && <span className="text-[10px] font-bold text-slate-400 ml-1">+{note.labels.length - 2}</span>}
                                        </div>
                                        <button 
                                            className="p-2 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all border-0 bg-transparent opacity-0 group-hover:opacity-100" 
                                            onClick={(e) => { e.stopPropagation(); confirmDelete(note); }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Note Editor Modal */}
            <AnimatePresence>
                {showModal && selectedNote && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-10">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/20 backdrop-blur-md" 
                            onClick={closeNote} 
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-6xl max-h-full modal-content rounded-[3rem] shadow-3xl overflow-hidden border border-white/50 flex flex-col"
                        >
                            <div className="px-8 py-6 flex items-center justify-between border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <button 
                                        className={`px-5 py-2 rounded-2xl text-sm font-bold transition-all border-0 flex items-center gap-2 ${selectedNote.is_pinned ? 'bg-emerald-800 text-white shadow-lg' : ''}`}
                                        style={!selectedNote.is_pinned ? { backgroundColor: 'var(--bg-button-muted)', color: 'var(--text-main)' } : {}}
                                        onClick={() => togglePin(selectedNote)}
                                    >
                                        <Pin size={16} fill={selectedNote.is_pinned ? "currentColor" : "none"} /> {selectedNote.is_pinned ? 'Đã ghim' : 'Ghim'}
                                    </button>
                                    <button 
                                        className="px-5 py-2 rounded-2xl text-sm font-bold border-0 flex items-center gap-2 transition-all" 
                                        style={{ backgroundColor: 'var(--bg-button-muted)', color: 'var(--text-main)' }}
                                        onClick={() => setShowShareModal(true)}
                                    >
                                        <Share2 size={16} /> Chia sẻ
                                    </button>
                                    <div className="hidden sm:flex items-center gap-2 ml-4">
                                        {isSaving ? (
                                            <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                                <Loader2 size={12} className="animate-spin" /> Đang lưu
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest">
                                                <CheckCircle2 size={12} /> Đã đồng bộ
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button className="w-10 h-10 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-all border-0 flex items-center justify-center shadow-lg shadow-rose-500/20" onClick={closeNote}>
                                    <X size={20} strokeWidth={3} />
                                </button>
                            </div>

                            <div className="flex-grow overflow-y-auto custom-scrollbar p-8 md:p-12">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                    <div className="lg:col-span-8 space-y-8">
                                        <input 
                                            type="text" 
                                            className="w-full font-extrabold border-0 bg-transparent p-0 focus:ring-0 placeholder:text-black placeholder:opacity-40 tracking-tight" 
                                            style={{ color: 'var(--note-text-color)', fontSize: 'var(--note-fs-modal-title)' }}
                                            placeholder="Tiêu đề..." 
                                            value={noteForm.title} 
                                            onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })} 
                                        />
                                        <textarea 
                                            className="w-full font-medium border-0 bg-transparent p-0 focus:ring-0 placeholder:text-black placeholder:opacity-40 resize-none leading-relaxed min-h-[400px]" 
                                            style={{ color: 'var(--note-text-color)', fontSize: 'var(--note-fs-modal-content)' }}
                                            placeholder="Bắt đầu ghi chú tại đây..." 
                                            value={noteForm.content} 
                                            onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                                        />
                                    </div>

                                    <div className="lg:col-span-4 space-y-8 h-full flex flex-col">

                                        {selectedNote.user_id === auth.user.id && (
                                            <div className="space-y-4 p-6 rounded-[2rem] border transition-colors" style={{ backgroundColor: 'var(--bg-button-muted)', borderColor: 'var(--border-color)' }}>
                                                <h4 className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest" onClick={() => setShowPasswordSettings(!showPasswordSettings)} style={{ cursor: 'pointer', color: 'var(--text-main)' }}>
                                                    <Shield size={16} className="text-emerald-700" /> Bảo mật
                                                </h4>
                                                {showPasswordSettings && (
                                                    <form onSubmit={handlePasswordChange} className="space-y-3">
                                                        {selectedNote.has_password && (
                                                            <input type="password" placeholder="Mật khẩu hiện tại" className="w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-700/10 transition-colors" style={{ backgroundColor: 'var(--bg-input-gray)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }} value={passwordForm.current_password} onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})} required />
                                                        )}
                                                        <input type="password" placeholder="Mật khẩu mới" className="w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-700/10 transition-colors" style={{ backgroundColor: 'var(--bg-input-gray)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }} value={passwordForm.password} onChange={(e) => setPasswordForm({...passwordForm, password: e.target.value})} required />
                                                        <input type="password" placeholder="Xác nhận lại" className="w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-700/10 transition-colors" style={{ backgroundColor: 'var(--bg-input-gray)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }} value={passwordForm.password_confirmation} onChange={(e) => setPasswordForm({...passwordForm, password_confirmation: e.target.value})} required />
                                                        <div className="flex gap-2 pt-2">
                                                            <button type="submit" className="flex-1 py-2 bg-emerald-800 text-white rounded-xl font-bold text-xs border-0">Lưu</button>
                                                            {selectedNote.has_password && (
                                                                <button type="button" className="flex-1 py-2 bg-rose-50 text-rose-500 rounded-xl font-bold text-xs border-0" onClick={disablePassword}>
                                                                    Tắt bảo mật
                                                                </button>
                                                            )}
                                                        </div>
                                                    </form>
                                                )}
                                                {!showPasswordSettings && selectedNote.has_password && <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold uppercase">Đã bảo vệ</span>}
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest" style={{ color: 'var(--text-main)' }}>
                                                <Tag size={16} className="text-emerald-700" /> Nhãn dán
                                            </h4>
                                            <form onSubmit={handleQuickAddLabel} className="relative group">
                                                <input type="text" className="w-full pl-4 pr-12 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-700/10 transition-colors" style={{ backgroundColor: 'var(--bg-input-gray)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }} placeholder="Thêm nhãn nhanh..." value={quickLabelName} onChange={(e) => setQuickLabelName(e.target.value)} />
                                                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-slate-100/10 text-slate-400 flex items-center justify-center hover:bg-emerald-800 hover:text-white transition-all border-0"><Plus size={16} /></button>
                                            </form>
                                            <div className="flex flex-wrap gap-2">
                                                {allLabels.map(label => {
                                                    const isSelected = selectedNote.labels.some(l => l.id === label.id);
                                                    return (
                                                        <button key={label.id} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-0 ${isSelected ? 'bg-emerald-800 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`} onClick={() => handleLabelSync(label)}>#{label.name}</button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest" style={{ color: 'var(--text-main)' }}>
                                                <Grid size={16} className="text-emerald-700" /> Hình ảnh
                                            </h4>
                                            <div className="grid grid-cols-3 gap-3">
                                                {selectedNote.images.map(img => (
                                                    <div key={img.id} className="flex flex-col gap-1">
                                                        <div className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 cursor-zoom-in" onClick={() => setPreviewImage(`/storage/${img.path}`)}>
                                                            <img src={`/storage/${img.path}`} className="w-full h-full object-cover" alt="note" />
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <button
                                                                className="flex-1 flex items-center justify-center gap-1 py-1 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all border-0 text-[11px] font-bold"
                                                                onClick={() => handleDeleteImage(img.id)}
                                                            >
                                                                <Trash2 size={12} /> Xóa
                                                            </button>
                                                            <label className="flex-1 flex items-center justify-center gap-1 py-1 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all border-0 text-[11px] font-bold cursor-pointer">
                                                                <MoreVertical size={12} /> Sửa
                                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, img.id)} />
                                                            </label>
                                                        </div>
                                                    </div>
                                                ))}
                                                <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 hover:border-emerald-700/50 hover:text-emerald-700 transition-all cursor-pointer">
                                                    <Plus size={24} />
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e)} />
                                                </label>
                                            </div>
                                        </div>

                                        <div className="pt-8 mt-auto">
                                            <button className="w-full py-4 rounded-[1.5rem] bg-rose-500 text-white font-black flex items-center justify-center gap-2 hover:bg-rose-600 transition-all border-0 shadow-lg shadow-rose-500/10" onClick={() => confirmDelete(selectedNote)}>
                                                <Trash2 size={18} strokeWidth={3} /> Xóa ghi chú này
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Sub-modals */}
            <NotePasswordModal show={showPasswordModal} note={pendingAction?.note} onSuccess={handlePasswordSuccess} onCancel={() => { setShowPasswordModal(false); setPendingAction(null); }} />
            <NoteShareModal show={showShareModal} note={selectedNote} onClose={() => setShowShareModal(false)} />
            <LabelManager show={showLabelManager} labels={allLabels} onClose={() => setShowLabelManager(false)} />
            <ConfirmationModal show={showDeleteModal} title="Xác nhận xóa" message="Dữ liệu ghi chú và hình ảnh sẽ bị xóa vĩnh viễn. Bạn chắc chắn chứ?" onConfirm={handleDelete} onCancel={() => setShowDeleteModal(false)} />
            
            {/* Image Preview Lightbox */}
            <AnimatePresence>
                {previewImage && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setPreviewImage(null)}>
                        <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} src={previewImage} className="max-w-full max-h-full rounded-3xl shadow-3xl" />
                        <button className="absolute top-10 right-10 w-12 h-12 rounded-2xl bg-white/10 text-white hover:bg-white hover:text-slate-900 transition-all border-0 flex items-center justify-center"><X size={24} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{ __html: `
                .glass-card-note {
                    background: var(--note-card-bg) !important;
                    backdrop-filter: blur(20px) saturate(180%);
                    -webkit-backdrop-filter: blur(20px) saturate(180%);
                    border: 1px solid var(--note-card-border) !important;
                }

                .modal-content {
                    background: var(--note-card-bg) !important;
                    backdrop-filter: blur(40px) saturate(200%);
                    -webkit-backdrop-filter: blur(40px) saturate(200%);
                    border: 1px solid var(--note-card-border) !important;
                }
                
                ::placeholder {
                    color: var(--note-placeholder-color) !important;
                    opacity: 0.4 !important;
                }
                
                input::placeholder, textarea::placeholder {
                    color: var(--note-placeholder-color) !important;
                    opacity: 0.4 !important;
                }
                
                input:focus, textarea:focus { outline: none !important; }
                
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                
                .no-underline { text-decoration: none !important; }
                
                .shadow-3xl {
                    box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.1);
                }
            `}} />
        </BootstrapLayout>
    );
}

