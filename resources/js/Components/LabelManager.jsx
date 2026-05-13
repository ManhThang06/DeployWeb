import { useState } from 'react';
import { router } from '@inertiajs/react';
import { confirmDestructive } from '@/Utils/sweetalert';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Plus, Trash2, Edit3, Check, Loader2 } from 'lucide-react';

export default function LabelManager({ show, labels, onClose }) {
    const [newLabel, setNewLabel] = useState('');
    const [editingLabel, setEditingLabel] = useState(null);
    const [editName, setEditName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newLabel.trim()) return;
        setIsProcessing(true);
        router.post(route('labels.store'), { name: newLabel }, {
            onSuccess: () => {
                setNewLabel('');
                setIsProcessing(false);
            },
            onError: () => setIsProcessing(false)
        });
    };

    const handleUpdate = (label) => {
        if (!editName.trim()) return;
        setIsProcessing(true);
        router.patch(route('labels.update', label.id), { name: editName }, {
            onSuccess: () => {
                setEditingLabel(null);
                setIsProcessing(false);
            },
            onError: () => setIsProcessing(false)
        });
    };

    const handleDelete = (id) => {
        confirmDestructive('Xóa nhãn?', 'Nhãn này sẽ bị gỡ khỏi tất cả ghi chú. Bạn chắc chắn chứ?').then((result) => {
            if (result.isConfirmed) {
                router.delete(route('labels.destroy', id));
            }
        });
    };

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" 
                        onClick={onClose} 
                    />
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-3xl overflow-hidden border border-slate-100"
                    >
                        <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50">
                            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                                <Tag size={20} className="text-emerald-700" /> Quản lý nhãn
                            </h3>
                            <button className="w-10 h-10 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-all border-0 flex items-center justify-center shadow-lg shadow-rose-500/20" onClick={onClose}>
                                <X size={20} strokeWidth={3} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <form onSubmit={handleAdd} className="relative group">
                                <input 
                                    type="text" 
                                    className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold placeholder:text-slate-400 focus:ring-4 focus:ring-emerald-700/5 focus:border-emerald-700 transition-all" 
                                    placeholder="Tạo nhãn mới..." 
                                    value={newLabel}
                                    onChange={(e) => setNewLabel(e.target.value)}
                                />
                                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center hover:bg-emerald-900 transition-all border-0 shadow-lg shadow-emerald-800/20" disabled={isProcessing}>
                                    {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} strokeWidth={3} />}
                                </button>
                            </form>

                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-2 space-y-2">
                                {labels.map(label => (
                                    <div key={label.id} className="group flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-all">
                                        {editingLabel === label.id ? (
                                            <div className="flex-1 flex items-center gap-2">
                                                <input 
                                                    type="text" 
                                                    className="flex-1 px-4 py-2 bg-white border border-emerald-700 rounded-xl text-sm font-bold focus:ring-0" 
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    autoFocus
                                                />
                                                <button className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center border-0" onClick={() => handleUpdate(label)}>
                                                    <Check size={16} />
                                                </button>
                                                <button className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center border-0" onClick={() => setEditingLabel(null)}>
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="font-bold text-slate-600 ml-2">#{label.name}</span>
                                                <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-all">
                                                    <button className="w-8 h-8 rounded-lg text-slate-400 hover:text-emerald-800 hover:bg-white transition-all border-0 bg-transparent" onClick={() => { setEditingLabel(label.id); setEditName(label.name); }}>
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border-0 bg-transparent" onClick={() => handleDelete(label.id)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <style dangerouslySetInnerHTML={{ __html: `
                        .shadow-3xl { box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.2); }
                        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                        input:focus { outline: none !important; }
                    `}} />
                </div>
            )}
        </AnimatePresence>
    );
}
