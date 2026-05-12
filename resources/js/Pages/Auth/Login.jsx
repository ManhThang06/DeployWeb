import BootstrapLayout from '@/Layouts/BootstrapLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, Leaf, LogIn, UserPlus } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-emerald-600/10 overflow-hidden font-inter tracking-tight">
            <Head title="Đăng nhập" />
            
            {/* Google Font: Inter */}
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

            {/* Forest Gradient Blobs */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <motion.div 
                    animate={{ 
                        x: [0, 120, 0], 
                        y: [0, -70, 0],
                        scale: [1, 1.2, 1] 
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[10%] -left-[5%] w-[55%] h-[55%] rounded-full bg-emerald-100/40 blur-[100px]"
                />
                <motion.div 
                    animate={{ 
                        x: [0, -100, 0], 
                        y: [0, 120, 0],
                        scale: [1.1, 1, 1.1] 
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[20%] -right-[5%] w-[50%] h-[50%] rounded-full bg-green-100/40 blur-[100px]"
                />
                <motion.div 
                    animate={{ 
                        x: [0, 80, 0], 
                        y: [0, 100, 0] 
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-[15%] left-[15%] w-[45%] h-[45%] rounded-full bg-teal-50/50 blur-[100px]"
                />
            </div>

            <main className="relative z-10 min-h-screen flex items-center justify-center p-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-[460px]"
                >
                    <div className="glass-forest-card p-8 md:p-12">
                        <div className="text-center mb-10">
                            <motion.div 
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex p-3.5 rounded-3xl bg-emerald-800 text-white mb-6 shadow-xl shadow-emerald-800/20"
                            >
                                <Leaf size={28} />
                            </motion.div>
                            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Chào mừng trở lại</h1>
                            <p className="text-slate-500 font-medium">Đăng nhập vào hệ thống quản lý ghi chú</p>
                        </div>

                        {status && (
                            <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-semibold border border-emerald-100">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Email</label>
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
                                    />
                                </div>
                                {errors.email && <p className="text-xs text-red-500 mt-2 ml-1 font-medium">{errors.email}</p>}
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2 px-1">
                                    <label className="text-sm font-bold text-slate-700">Mật khẩu</label>
                                    {canResetPassword && (
                                        <Link href={route('password.request')} className="text-xs font-bold text-emerald-800 hover:text-emerald-900 transition-colors no-underline">Quên mật khẩu?</Link>
                                    )}
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-700 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        className={`w-full pl-12 pr-4 py-4 bg-white/60 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-emerald-700/5 focus:border-emerald-700 transition-all duration-300 ${errors.password ? 'border-red-500' : ''}`}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                {errors.password && <p className="text-xs text-red-500 mt-2 ml-1 font-medium">{errors.password}</p>}
                            </div>

                            <div className="flex items-center px-1">
                                <label className="flex items-center cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded-lg border-slate-300 text-emerald-800 focus:ring-emerald-700 transition-all cursor-pointer"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                    />
                                    <span className="ml-3 text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">Duy trì đăng nhập</span>
                                </label>
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
                                            Đăng nhập <ArrowRight size={18} strokeWidth={2.5} />
                                        </>
                                    )}
                                </motion.button>
                            </div>

                            <div className="text-center pt-4">
                                <p className="text-sm text-slate-500 font-medium">
                                    Chưa có tài khoản?{' '}
                                    <Link href={route('register')} className="text-emerald-800 font-bold hover:text-emerald-900 no-underline transition-colors flex items-center justify-center gap-1 mt-2">
                                        <UserPlus size={16} /> Tạo tài khoản mới ngay
                                    </Link>
                                </p>
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
            `}} />
        </div>
    );
}
