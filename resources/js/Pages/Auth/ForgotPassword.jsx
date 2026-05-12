import BootstrapLayout from '@/Layouts/BootstrapLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Loader2, Leaf, ArrowLeft } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-emerald-600/10 overflow-hidden font-inter tracking-tight">
            <Head title="Quên mật khẩu" />
            
            {/* Google Font: Inter */}
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

            {/* Forest Gradient Blobs */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <motion.div 
                    animate={{ 
                        x: [0, 80, 0], 
                        y: [0, -50, 0],
                        scale: [1, 1.1, 1] 
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[10%] left-[10%] w-[45%] h-[45%] rounded-full bg-emerald-100/40 blur-[100px]"
                />
                <motion.div 
                    animate={{ 
                        x: [0, -60, 0], 
                        y: [0, 80, 0] 
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-green-100/40 blur-[100px]"
                />
            </div>

            <main className="relative z-10 min-h-screen flex items-center justify-center p-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-[460px]"
                >
                    <div className="glass-forest-card p-8 md:p-12">
                        <div className="mb-8">
                            <Link href={route('login')} className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-800 transition-colors no-underline font-semibold text-sm group">
                                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Quay lại đăng nhập
                            </Link>
                        </div>

                        <div className="text-center mb-10">
                            <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="inline-flex p-3.5 rounded-3xl bg-emerald-800 text-white mb-6 shadow-xl shadow-emerald-800/20"
                            >
                                <Leaf size={28} />
                            </motion.div>
                            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Quên mật khẩu?</h1>
                            <p className="text-slate-500 font-medium px-4">Đừng lo lắng, hãy nhập email của bạn để nhận liên kết đặt lại mật khẩu.</p>
                        </div>

                        {status && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mb-8 p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-semibold border border-emerald-100 flex items-center gap-3"
                            >
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                {status}
                            </motion.div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Địa chỉ Email</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-700 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        className={`w-full pl-12 pr-4 py-4 bg-white/60 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-emerald-700/5 focus:border-emerald-700 transition-all duration-300 ${errors.email ? 'border-red-500' : ''}`}
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="your@email.com"
                                        required
                                        autoFocus
                                    />
                                </div>
                                {errors.email && <p className="text-xs text-red-500 mt-2 ml-1 font-medium">{errors.email}</p>}
                            </div>

                            <div className="pt-2">
                                <motion.button 
                                    whileHover={{ scale: 1.01, translateY: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit" 
                                    className="w-full bg-emerald-800 text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-800/20 hover:bg-emerald-900 transition-all flex items-center justify-center gap-2 disabled:opacity-70 no-underline" 
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <>
                                            Gửi liên kết đặt lại <ArrowRight size={18} strokeWidth={2.5} />
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </main>

            <style dangerouslySetInnerHTML={{ __html: `
                .font-inter { font-family: 'Inter', sans-serif; }
                
                .glass-forest-card {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(20px) saturate(180%);
                    -webkit-backdrop-filter: blur(20px) saturate(180%);
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    border-radius: 2.5rem;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
                }
                
                input:focus { outline: none !important; }
                .no-underline { text-decoration: none !important; }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin { animation: spin 1s linear infinite; }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            `}} />
        </div>
    );
}
