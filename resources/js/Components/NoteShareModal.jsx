import { useState } from 'react';
import { router } from '@inertiajs/react';
import { confirmDestructive } from '@/Utils/sweetalert';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Mail, Users, Trash2, CheckCircle2, Loader2, Shield, Eye, Edit3 } from 'lucide-react';

export default function NoteShareModal({ show, note, onClose }) {
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState('read');
    const [processing, setProcessing] = useState(false);

    const handleShare = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route('notes.share', note.id), { email, permission }, {
            onSuccess: () => {
                setEmail('');
                setProcessing(false);
            },
            onError: () => setProcessing(false)
        });
    };

    const handleUpdate = (userId, newPermission) => {
        router.patch(route('notes.share.update', [note.id, userId]), { permission: newPermission });
    };

    const handleRevoke = (userId) => {
        confirmDestructive('Thu hồi quyền?', 'Người dùng này sẽ không thể truy cập ghi chú này nữa. Bạn có chắc chắn?').then((result) => {
            if (result.isConfirmed) {
                router.patch(route('notes.share.update', [note.id, userId]), { revoke: true });
            }
        });
    };

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" 
                        onClick={onClose} 
                    />
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-[500px] bg-white rounded-[3rem] shadow-3xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
                    >
                        <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50">
                            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                                    <Share2 size={20} />
                                </div>
                                Chia sẻ ghi chú
                            </h3>
                            <button className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-500 hover:text-slate-900 transition-all border-0" onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                            <form onSubmit={handleShare} className="space-y-4">
                                <label className="block text-[13px] font-bold text-slate-700 ml-1 uppercase tracking-wider opacity-60">Mời thành viên mới</label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1 relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <input 
                                            type="email" 
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold placeholder:text-slate-400 focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all shadow-sm" 
                                            placeholder="email@example.com" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <select 
                                            className="px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-bold text-sm focus:ring-0 appearance-none cursor-pointer" 
                                            value={permission}
                                            onChange={(e) => setPermission(e.target.value)}
                                        >
                                            <option value="read">Xem</option>
                                            <option value="edit">Sửa</option>
                                        </select>
                                        <button className="px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all border-0 disabled:opacity-70" type="submit" disabled={processing}>
                                            {processing ? <Loader2 size={18} className="animate-spin" /> : 'Mời'}
                                        </button>
                                    </div>
                                </div>
                            </form>

                            <div className="space-y-4">
                                <h4 className="text-[13px] font-bold text-slate-700 ml-1 uppercase tracking-wider opacity-60 flex items-center gap-2">
                                    <Users size={16} /> Người dùng có quyền truy cập
                                </h4>
                                <div className="space-y-3">
                                    {note.shared_with && note.shared_with.length > 0 ? (
                                        note.shared_with.map(user => (
                                            <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-blue-200 transition-all">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                                                        <Users size={18} />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <div className="font-extrabold text-sm text-slate-900 text-truncate">{user.display_name}</div>
                                                        <div className="text-[11px] font-bold text-slate-400 text-truncate">{user.email}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="relative">
                                                        <select 
                                                            className="pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-extrabold uppercase tracking-tight text-slate-600 focus:ring-0 appearance-none cursor-pointer hover:border-blue-300 transition-all"
                                                            value={user.pivot.permission}
                                                            onChange={(e) => handleUpdate(user.id, e.target.value)}
                                                        >
                                                            <option value="read">Xem</option>
                                                            <option value="edit">Sửa</option>
                                                        </select>
                                                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                            {user.pivot.permission === 'edit' ? <Edit3 size={12} /> : <Eye size={12} />}
                                                        </div>
                                                    </div>
                                                    <button className="w-8 h-8 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-white transition-all border-0 bg-transparent flex items-center justify-center" onClick={() => handleRevoke(user.id)}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                            <Share2 size={32} className="mx-auto text-slate-200 mb-3" />
                                            <p className="text-sm font-bold text-slate-400 px-10 leading-relaxed">
                                                Ghi chú này hiện đang ở chế độ riêng tư. Hãy mời người khác để cùng cộng tác!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100 mt-auto text-center">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Giao thức bảo mật NotePro v2.0</p>
                        </div>
                    </motion.div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .shadow-3xl { box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.2); }
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                input:focus { outline: none !important; }
                select:focus { outline: none !important; }
            `}} />
        </AnimatePresence>
    );
}
