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
        text_color: '#212529'
    };

    const colorMap = {
        blue: '#2563eb',
        green: '#065f46',
        red: '#dc2626',
        orange: '#ea580c',
        purple: '#7c3aed'
    };

    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-bs-theme', preferences.theme || 'light');
        document.body.className = `font-inter tracking-tight bg-slate-50`;
        
        // Define specific font sizes for notes based on preference
        const fontSizes = {
            small: { cardT: '0.9rem', cardC: '0.75rem', modalT: '2.4rem', modalC: '1rem' },
            medium: { cardT: '1.125rem', cardC: '0.875rem', modalT: '3rem', modalC: '1.25rem' },
            large: { cardT: '1.35rem', cardC: '1.05rem', modalT: '3.6rem', modalC: '1.5rem' }
        };
        const activeFS = fontSizes[preferences.font_size] || fontSizes.medium;
        
        root.style.setProperty('--note-fs-card-title', activeFS.cardT);
        root.style.setProperty('--note-fs-card-content', activeFS.cardC);
        root.style.setProperty('--note-fs-modal-title', activeFS.modalT);
        root.style.setProperty('--note-fs-modal-content', activeFS.modalC);

        // Set Note Colors
        const primaryColor = colorMap[preferences.color_scheme] || colorMap.green;
        const textColor = preferences.text_color || (preferences.theme === 'dark' ? '#f8fafc' : '#212529');
        
        root.style.setProperty('--note-primary-color', primaryColor);
        root.style.setProperty('--note-text-color', textColor);
        
        // Background color for cards (tinted by primary color)
        const bgAlpha = preferences.theme === 'dark' ? '0.4' : '0.15';
        root.style.setProperty('--note-bg-alpha', bgAlpha);
        
        // Background color for modal (slightly stronger tint)
        const modalTint = preferences.theme === 'dark' ? '0.25' : '0.1';
        root.style.setProperty('--note-modal-tint', modalTint);
        
        // Design System Variables
        if (preferences.theme === 'dark') {
            root.style.setProperty('--bg-main', '#020617'); // Slate-950
            root.style.setProperty('--bg-card', '#0f172a'); // Slate-900
            root.style.setProperty('--bg-header', 'rgba(15, 23, 42, 0.8)');
            root.style.setProperty('--border-color', '#1e293b'); // Slate-800
            root.style.setProperty('--text-main', '#f8fafc');
            root.style.setProperty('--text-muted', '#94a3b8');
        } else {
            root.style.setProperty('--bg-main', '#f8fafc'); // Slate-50
            root.style.setProperty('--bg-card', '#ffffff');
            root.style.setProperty('--bg-header', 'rgba(255, 255, 255, 0.7)');
            root.style.setProperty('--border-color', '#e2e8f0'); // Slate-200
            root.style.setProperty('--text-main', '#0f172a');
            root.style.setProperty('--text-muted', '#64748b');
        }
        
        // For Bootstrap-based SharedNotes.jsx
        root.style.setProperty('--note-bg-color', preferences.theme === 'dark' ? '#0f172a' : '#ffffff');
        root.style.setProperty('--note-primary-rgb', hexToRgb(primaryColor));
    }, [preferences]);

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '16, 185, 129';
    }

    const isDashboard = route().current('dashboard');
    const isSettings = route().current('settings.edit');

    return (
        <div className="min-h-screen relative overflow-hidden font-inter transition-colors duration-500" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
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
                    className={`absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full ${preferences.theme === 'dark' ? 'bg-emerald-900/10' : 'bg-emerald-100/30'} blur-[120px]`}
                />
                <motion.div 
                    animate={{ 
                        x: [0, -80, 0], 
                        y: [0, 100, 0],
                        scale: [1.1, 1, 1.1] 
                    }}
                    transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full ${preferences.theme === 'dark' ? 'bg-green-900/10' : 'bg-green-100/30'} blur-[120px]`}
                />
            </div>

            {/* Glassmorphism Header */}
            <header className="sticky top-0 z-[100] w-full px-6 py-4">
                <div className="max-w-7xl mx-auto">
                    <nav className="glass-header rounded-[2rem] px-6 py-3 flex items-center justify-between border border-white/20 shadow-xl shadow-emerald-900/5 transition-colors duration-500" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-header)' }}>
                        <Link href="/" className="flex items-center gap-3 no-underline group">
                            <div className="w-10 h-10 bg-emerald-800 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-800/20 group-hover:scale-110 transition-transform duration-300">
                                <Leaf className="text-white" size={20} />
                            </div>
                            <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>NotePro</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-2">
                            <div className="p-1.5 rounded-[1.5rem] flex items-center mr-4 relative transition-colors duration-500" style={{ backgroundColor: preferences.theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(226, 232, 240, 0.5)' }}>
                                <Link 
                                    href={route('dashboard')} 
                                    className={`relative z-10 px-6 py-2 rounded-xl text-sm font-bold transition-colors duration-300 no-underline flex items-center gap-2 ${isDashboard ? (preferences.theme === 'dark' ? 'text-emerald-400' : 'text-emerald-900') : 'text-slate-500 hover:text-slate-900'}`}
                                >
                                    <LayoutDashboard size={16} /> Ghi chú
                                    {isDashboard && (
                                        <motion.div 
                                            layoutId="activeTab"
                                            className="absolute inset-0 rounded-xl shadow-sm -z-10 transition-colors duration-500"
                                            style={{ backgroundColor: preferences.theme === 'dark' ? '#1e293b' : '#ffffff' }}
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </Link>
                                <Link 
                                    href={route('settings.edit')} 
                                    className={`relative z-10 px-6 py-2 rounded-xl text-sm font-bold transition-colors duration-300 no-underline flex items-center gap-2 ${isSettings ? (preferences.theme === 'dark' ? 'text-emerald-400' : 'text-emerald-900') : 'text-slate-500 hover:text-slate-900'}`}
                                >
                                    <Settings size={16} /> Cài đặt
                                    {isSettings && (
                                        <motion.div 
                                            layoutId="activeTab"
                                            className="absolute inset-0 rounded-xl shadow-sm -z-10 transition-colors duration-500"
                                            style={{ backgroundColor: preferences.theme === 'dark' ? '#1e293b' : '#ffffff' }}
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </Link>
                            </div>

                        </div>

                        {/* Mobile Toggle */}
                        <button 
                            className="lg:hidden w-10 h-10 rounded-2xl flex items-center justify-center transition-colors duration-500 border-0"
                            style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
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
                    backdrop-filter: blur(20px) saturate(180%);
                    -webkit-backdrop-filter: blur(20px) saturate(180%);
                }
                
                .no-underline { text-decoration: none !important; }
                
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }
                
                .font-size-small { font-size: 0.875rem; }
                .font-size-medium { font-size: 1rem; }
                .font-size-large { font-size: 1.125rem; }

                /* Premium Card Effect */
                .glass-card-note {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                [data-bs-theme="dark"] body {
                    background-color: #020617 !important;
                }
            `}} />
        </div>
    );
}

function HeadLink() {
    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
            <style>{`
                body { transition: background-color 0.5s ease; }
            `}</style>
        </>
    );
}
