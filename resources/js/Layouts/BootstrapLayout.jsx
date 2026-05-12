import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ActivationWarningBanner from '@/Components/ActivationWarningBanner';

export default function BootstrapLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    // --- Tab Animation Logic ---
    // For Guests
    const guestTab = route().current('register') ? 'register' : 'login';
    const [guestSliderPos, setGuestSliderPos] = useState(() => {
        const last = sessionStorage.getItem('last_guest_tab');
        return last === 'register' ? 'calc(50%)' : '4px';
    });

    // For Auth Users
    const authTab = route().current('settings.edit') ? 'settings' : 'dashboard';
    const [authSliderPos, setAuthSliderPos] = useState(() => {
        const last = sessionStorage.getItem('last_auth_tab');
        return last === 'settings' ? 'calc(50%)' : '4px';
    });

    useEffect(() => {
        // Animation delay to ensure mount is complete
        const timer = setTimeout(() => {
            setGuestSliderPos(guestTab === 'register' ? 'calc(50%)' : '4px');
            setAuthSliderPos(authTab === 'settings' ? 'calc(50%)' : '4px');
        }, 50);

        sessionStorage.setItem('last_guest_tab', guestTab);
        sessionStorage.setItem('last_auth_tab', authTab);

        return () => clearTimeout(timer);
    }, [guestTab, authTab]);
    // ----------------------------
    
    // Default preferences
    const preferences = user?.preferences || { 
        font_size: 'medium', 
        color_scheme: 'blue', 
        theme: 'light',
        text_color: ''
    };

    useEffect(() => {
        const root = document.documentElement;
        
        // 1. Apply BS5 Theme
        root.setAttribute('data-bs-theme', preferences.theme || 'light');

        // 2. Map color schemes to actual hex values
        const colorMap = {
            blue: { hex: '#0d6efd', rgb: '13, 110, 253' },
            green: { hex: '#198754', rgb: '25, 135, 84' },
            red: { hex: '#dc3545', rgb: '220, 53, 69' },
            orange: { hex: '#fd7e14', rgb: '253, 126, 20' },
            purple: { hex: '#6f42c1', rgb: '111, 66, 193' }
        };
        const themeColors = colorMap[preferences.color_scheme] || colorMap.blue;
        
        // 3. Apply Note-specific CSS Variables
        root.style.setProperty('--note-primary-color', themeColors.hex);
        root.style.setProperty('--note-primary-rgb', themeColors.rgb);
        
        // Create a very bold version for the background to satisfy the demand for more intensity
        const bgColor = preferences.theme === 'dark' 
            ? `rgba(${themeColors.rgb}, 0.38)` 
            : `rgba(${themeColors.rgb}, 0.25)`;
        root.style.setProperty('--note-bg-color', bgColor);
        
        root.style.setProperty('--note-text-color', preferences.text_color || (preferences.theme === 'dark' ? '#ffffff' : '#212529'));
        
        // 4. Apply classes for font size
        document.body.className = `font-size-${preferences.font_size || 'medium'}`;
    }, [preferences]);

    // Helper to convert hex to RGB for BS5 variables
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
    }

    const [isNavOpen, setIsNavOpen] = useState(false);

    return (
        <div className="min-vh-100 d-flex flex-column bg-body text-body transition-all">
            <ActivationWarningBanner />

            <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top py-2">
                <div className="container">
                    <Link className="navbar-brand fw-bold d-flex align-items-center" href="/">
                        <div className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                            <i className="bi bi-journal-text"></i>
                        </div>
                        NotePro
                    </Link>
                    <button className="navbar-toggler border-0 shadow-none" type="button" onClick={() => setIsNavOpen(!isNavOpen)}>
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    {/* Mobile Dropdown Menu */}
                    <div 
                        className={`d-lg-none position-absolute end-0 mt-2 me-3 shadow-lg rounded-4 overflow-hidden bg-body border transition-all ${isNavOpen ? 'opacity-100 translate-middle-y-0' : 'opacity-0 translate-middle-y-n2 pointer-events-none'}`}
                        style={{ 
                            top: '100%', 
                            width: '200px', 
                            zIndex: 1050,
                            transform: isNavOpen ? 'translateY(0)' : 'translateY(-10px)',
                            visibility: isNavOpen ? 'visible' : 'hidden',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        <div className="p-2 d-flex flex-column gap-1">
                            {user ? (
                                <>
                                    <Link 
                                        href={route('dashboard')} 
                                        className={`d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none transition-all ${route().current('dashboard') && !route().current('notes.shared-with-me') ? 'bg-primary text-white shadow-sm' : 'text-body hover-bg-light'}`}
                                        onClick={() => setIsNavOpen(false)}
                                    >
                                        <i className="bi bi-journal-text fs-5"></i>
                                        <span className="fw-medium">Ghi chú</span>
                                    </Link>
                                    <Link 
                                        href={route('settings.edit')} 
                                        className={`d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none transition-all ${route().current('settings.edit') ? 'bg-primary text-white shadow-sm' : 'text-body hover-bg-light'}`}
                                        onClick={() => setIsNavOpen(false)}
                                    >
                                        <i className="bi bi-gear-fill fs-5"></i>
                                        <span className="fw-medium">Cài đặt</span>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href={route('login')} className="px-3 py-2 text-body text-decoration-none hover-bg-light rounded-3" onClick={() => setIsNavOpen(false)}>Đăng nhập</Link>
                                    <Link href={route('register')} className="px-3 py-2 text-body text-decoration-none hover-bg-light rounded-3" onClick={() => setIsNavOpen(false)}>Đăng ký</Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Desktop Menu */}
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto align-items-center">
                            {user && (
                                <li className="nav-item ms-lg-3 d-none d-lg-block">
                                    <div className="d-flex bg-white bg-opacity-25 rounded-pill p-1 position-relative" style={{ width: '240px', height: '40px' }}>
                                        <div 
                                            className="position-absolute bg-white rounded-pill shadow-sm" 
                                            style={{ 
                                                width: 'calc(50% - 4px)', 
                                                height: '32px', 
                                                top: '4px', 
                                                left: authSliderPos, 
                                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                zIndex: 0,
                                                opacity: route().current('notes.shared-with-me') ? 0 : 1
                                            }} 
                                        />
                                        
                                        <Link 
                                            href={route('dashboard')} 
                                            className={`w-50 d-flex align-items-center justify-content-center text-decoration-none rounded-pill position-relative z-1 transition-all ${route().current('dashboard') && !route().current('notes.shared-with-me') ? 'text-primary fw-bold' : 'text-white'}`}
                                            style={{ fontSize: '0.9rem', lineHeight: '1' }}
                                        >
                                            <i className="bi bi-journal-text me-2"></i> Ghi chú
                                        </Link>
                                        
                                        <Link 
                                            href={route('settings.edit')} 
                                            className={`w-50 d-flex align-items-center justify-content-center text-decoration-none rounded-pill position-relative z-1 transition-all ${route().current('settings.edit') ? 'text-primary fw-bold' : 'text-white'}`}
                                            style={{ fontSize: '0.9rem', lineHeight: '1' }}
                                        >
                                            <i className="bi bi-gear-fill me-2"></i> Cài đặt
                                        </Link>
                                    </div>
                                </li>
                            )}
                            {!user && (
                                <li className="nav-item ms-lg-3 d-none d-lg-block">
                                    <div className="d-flex bg-white bg-opacity-25 rounded-pill p-1 position-relative" style={{ width: '210px', height: '40px' }}>
                                        <div 
                                            className="position-absolute bg-white rounded-pill shadow-sm" 
                                            style={{ 
                                                width: 'calc(50% - 4px)', 
                                                height: '32px', 
                                                top: '4px', 
                                                left: guestSliderPos, 
                                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                zIndex: 0
                                            }} 
                                        />
                                        
                                        <Link 
                                            href={route('login')} 
                                            className={`w-50 d-flex align-items-center justify-content-center text-decoration-none rounded-pill position-relative z-1 transition-all ${route().current('login') || (!route().current('login') && !route().current('register')) ? 'text-primary fw-bold' : 'text-white'}`}
                                            style={{ fontSize: '0.9rem', lineHeight: '1' }}
                                        >
                                            Đăng nhập
                                        </Link>
                                        
                                        <Link 
                                            href={route('register')} 
                                            className={`w-50 d-flex align-items-center justify-content-center text-decoration-none rounded-pill position-relative z-1 transition-all ${route().current('register') ? 'text-primary fw-bold' : 'text-white'}`}
                                            style={{ fontSize: '0.9rem', lineHeight: '1' }}
                                        >
                                            Đăng ký
                                        </Link>
                                    </div>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>

            <main className="flex-grow-1 py-4 bg-body-tertiary">
                <div className="container">
                    {children}
                </div>
            </main>

            <footer className="py-4 bg-body border-top text-center opacity-75 small">
                <div className="container">
                    &copy; 2024 NotePro. Phát triển bởi Đội ngũ Senior Full-stack.
                </div>
            </footer>

            <style dangerouslySetInnerHTML={{ __html: `
                .hover-bg-light:hover { background-color: var(--bs-tertiary-bg); }
                .pointer-events-none { pointer-events: none; }
            `}} />
        </div>
    );
}
