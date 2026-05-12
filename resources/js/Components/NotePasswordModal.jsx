import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck, X, Loader2, ArrowRight } from 'lucide-react';

export default function NotePasswordModal({ show, note, onSuccess, onCancel }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(route('notes.verify-password', note.id), { password });
            if (response.data.success) {
                onSuccess(password);
                setPassword('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Mật khẩu không đúng.');
        } finally {
            setLoading(false);
        }
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
                        onClick={onCancel} 
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-[400px] bg-white rounded-[3rem] shadow-3xl overflow-hidden border border-slate-100 p-8 md:p-10"
                    >
                        <div className="text-center space-y-6">
                            <div className="inline-flex p-4 rounded-3xl bg-amber-50 text-amber-600 shadow-xl shadow-amber-600/10">
                                <Lock size={32} />
                            </div>
                            
                            <div>
                                <h3 className="text-2xl font-extrabold text-slate-900">Ghi chú đã bị khóa</h3>
                                <p className="text-slate-500 font-medium mt-2">Vui lòng nhập mật khẩu bảo mật để truy cập nội dung này.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="relative group">
                                    <input 
                                        type="password" 
                                        className={`w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-emerald-700/5 focus:border-emerald-700 transition-all ${error ? 'border-rose-500 ring-rose-500/10' : ''}`} 
                                        placeholder="••••••••" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoFocus
                                        required
                                    />
                                    {error && <p className="text-xs text-rose-500 font-bold mt-2">{error}</p>}
                                </div>

                                <div className="pt-2 space-y-3">
                                    <button 
                                        type="submit" 
                                        className="w-full py-4 bg-emerald-800 text-white rounded-2xl font-extrabold shadow-xl shadow-emerald-800/20 hover:bg-emerald-900 transition-all border-0 flex items-center justify-center gap-2 disabled:opacity-70" 
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 size={20} className="animate-spin" /> : <>Xác nhận <ArrowRight size={18} /></>}
                                    </button>
                                    <button 
                                        type="button" 
                                        className="w-full py-3 text-slate-400 font-bold hover:text-slate-600 transition-all border-0 bg-transparent text-sm" 
                                        onClick={onCancel}
                                    >
                                        Hủy bỏ
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
