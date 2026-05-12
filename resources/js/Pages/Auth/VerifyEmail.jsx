import BootstrapLayout from '@/Layouts/BootstrapLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Loader2, Leaf, LogOut } from 'lucide-react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-emerald-600/10 overflow-hidden font-inter tracking-tight">
            <Head title="Xác thực Email" />
            
            {/* Google Font: Inter */}
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

            {/* Forest Gradient Blobs */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <motion.div 
                    animate={{ 
                        x: [0, 90, 0], 
                        y: [0, -40, 0],
                        scale: [1, 1.1, 1] 
                    }}
                    transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[5%] right-[5%] w-[50%] h-[50%] rounded-full bg-emerald-100/40 blur-[100px]"
                />
                <motion.div 
                    animate={{ 
                        x: [0, -70, 0], 
                        y: [0, 60, 0] 
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[5%] left-[5%] w-[45%] h-[45%] rounded-full bg-green-100/40 blur-[100px]"
                />
            </div>

            <main className="relative z-10 min-h-screen flex items-center justify-center p-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-[500px]"
                >
                    <div className="glass-forest-card p-8 md:p-12">
                        <div className="text-center mb-10">
                            <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="inline-flex p-3.5 rounded-3xl bg-emerald-800 text-white mb-6 shadow-xl shadow-emerald-800/20"
                            >
                                <Mail size={28} />
                            </motion.div>
                            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Xác thực Email</h1>
                            <p className="text-slate-500 font-medium px-4">
                                Cảm ơn bạn đã đăng ký! Vui lòng xác thực email của bạn bằng cách nhấn vào liên kết chúng tôi vừa gửi.
                            </p>
                        </div>

                        {status === 'verification-link-sent' && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mb-8 p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-semibold border border-emerald-100 flex items-center gap-3"
                            >
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Một liên kết xác thực mới đã được gửi tới email của bạn.
                            </motion.div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
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
                                            Gửi lại email xác thực <ArrowRight size={18} strokeWidth={2.5} />
                                        </>
                                    )}
                                </motion.button>
                            </div>

                            <div className="text-center pt-2">
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="text-slate-500 font-bold hover:text-emerald-800 no-underline transition-colors flex items-center justify-center gap-2 mx-auto"
                                >
                                    <LogOut size={16} /> Đăng xuất
                                </Link>
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
                
                button { border: none !important; }
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
