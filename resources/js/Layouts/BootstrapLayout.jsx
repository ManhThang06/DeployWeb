import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ActivationWarningBanner from '@/Components/ActivationWarningBanner';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Settings, LogOut, Menu, X, Leaf } from 'lucide-react';

export default function BootstrapLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const preferences = user?.preferences || { 
        font_size: 'medium', 
        color_scheme: 'green',
        theme: 'light',
        text_color: ''
    };

    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-bs-theme', preferences.theme || 'light');
        document.body.className = `font-size-${preferences.font_size || 'medium'} font-inter tracking-tight bg-slate-50`;
    }, [preferences]);

    const isDashboard = route().current('dashboard');
    const isSettings = route().current('settings.edit');

    return (
        <div className="min-h-screen relative overflow-hidden font-inter selection:bg-emerald-600/10">
            <HeadLink />
            <ActivationWarningBanner />

            {/* Modern SaaS Background Blobs */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div 
                    animate={{ 
                        x: [0, 100, 0], 
                        y: [0, -50, 0],
                        scale: [1, 1.2, 1] 
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-emerald-100/30 blur-[120px]"
                />
                <motion.div 
                    animate={{ 
                        x: [0, -80, 0], 
                        y: [0, 100, 0],
                        scale: [1.1, 1, 1.1] 
                    }}
                    transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-green-100/30 blur-[120px]"
                />
            </div>

            {/* Glassmorphism Header */}
            <header className="sticky top-0 z-[100] w-full px-6 py-4">
                <div className="max-w-7xl mx-auto">
                    <nav className="glass-header rounded-[2rem] px-6 py-3 flex items-center justify-between border border-white/40 shadow-xl shadow-emerald-900/5">
                        <Link href="/" className="flex items-center gap-3 no-underline group">
                            <div className="w-10 h-10 bg-emerald-800 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-800/20 group-hover:scale-110 transition-transform duration-300">
                                <Leaf className="text-white" size={20} />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-900">NotePro</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-2">
                            <div className="bg-slate-200/50 p-1.5 rounded-[1.5rem] flex items-center mr-4 relative">
                                <Link 
                                    href={route('dashboard')} 
                                    className={`relative z-10 px-6 py-2 rounded-xl text-sm font-bold transition-colors duration-300 no-underline flex items-center gap-2 ${isDashboard ? 'text-emerald-900' : 'text-slate-500 hover:text-slate-900'}`}
                                >
                                    <LayoutDashboard size={16} /> Ghi chú
                                    {isDashboard && (
                                        <motion.div 
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-white rounded-xl shadow-sm -z-10"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </Link>
                                <Link 
                                    href={route('settings.edit')} 
                                    className={`relative z-10 px-6 py-2 rounded-xl text-sm font-bold transition-colors duration-300 no-underline flex items-center gap-2 ${isSettings ? 'text-emerald-900' : 'text-slate-500 hover:text-slate-900'}`}
                                >
                                    <Settings size={16} /> Cài đặt
                                    {isSettings && (
                                        <motion.div 
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-white rounded-xl shadow-sm -z-10"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </Link>
                            </div>

                            <Link 
                                href={route('logout')} 
                                method="post" 
                                as="button"
                                className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border-0 bg-transparent"
                            >
                                <LogOut size={20} />
                            </Link>
                        </div>

                        {/* Mobile Toggle */}
                        <button 
                            className="lg:hidden w-10 h-10 rounded-2xl flex items-center justify-center text-slate-600 bg-slate-100/50 border-0"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </nav>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-x-6 top-24 z-[90] lg:hidden"
                    >
                        <div className="glass-header rounded-3xl p-4 border border-white/40 shadow-2xl">
                            <div className="flex flex-column gap-2">
                                <Link 
                                    href={route('dashboard')} 
                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl no-underline font-bold transition-all ${isDashboard ? 'bg-emerald-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <LayoutDashboard size={20} /> Ghi chú
                                </Link>
                                <Link 
                                    href={route('settings.edit')} 
                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl no-underline font-bold transition-all ${isSettings ? 'bg-emerald-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <Settings size={20} /> Cài đặt
                                </Link>
                                <hr className="my-2 border-slate-200" />
                                <Link 
                                    href={route('logout')} 
                                    method="post" 
                                    as="button"
                                    className="flex items-center gap-3 px-4 py-3 rounded-2xl no-underline font-bold text-rose-500 hover:bg-rose-50 transition-all border-0 bg-transparent text-left w-full"
                                >
                                    <LogOut size={20} /> Đăng xuất
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area with Page Transitions */}
            <AnimatePresence mode="wait">
                <motion.main 
                    key={route().current()}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative px-6 pb-20"
                >
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </motion.main>
            </AnimatePresence>

            {/* Minimalist Footer */}
            <footer className="relative z-10 py-10 text-center">
                <p className="text-sm font-medium text-slate-400">
                    &copy; 2024 <span className="text-slate-600 font-bold">NotePro</span>. Designed for productivity.
                </p>
            </footer>

            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
                
                .font-inter { font-family: 'Inter', sans-serif; }
                
                .glass-header {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(20px) saturate(180%);
                    -webkit-backdrop-filter: blur(20px) saturate(180%);
                }
                
                .no-underline { text-decoration: none !important; }
                
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
                
                .font-size-small { font-size: 0.875rem !important; }
                .font-size-medium { font-size: 1rem !important; }
                .font-size-large { font-size: 1.125rem !important; }
            `}} />
        </div>
    );
}

function HeadLink() {
    return (
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
    );
}
