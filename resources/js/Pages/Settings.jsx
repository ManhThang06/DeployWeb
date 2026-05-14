import BootstrapLayout from '@/Layouts/BootstrapLayout';
import { Head, useForm, usePage, router, Link } from '@inertiajs/react';
import { useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Palette, Camera, Mail, Lock, CheckCircle2, Loader2, LogOut, Trash2, Sun, Moon, Type, Pipette } from 'lucide-react';

export default function Settings({ status }) {
    const { auth } = usePage().props;
    const [activeTab, setActiveTab] = useState('account');
    const avatarInput = useRef();
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    // Account Form
    const accountForm = useForm({
        display_name: auth.user.display_name || '',
        avatar: null,
    });

    // Password Form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Appearance Form
    const preferences = auth.user.preferences || { 
        font_size: 'medium', 
        color_scheme: 'green', 
        theme: 'light',
        text_color: '#212529'
    };
    const appearanceForm = useForm({
        font_size: preferences.font_size || 'medium',
        color_scheme: preferences.color_scheme || 'green',
        theme: preferences.theme || 'light',
        text_color: preferences.text_color || (preferences.theme === 'dark' ? '#ffffff' : '#212529'),
    });

    const updateAccount = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('display_name', accountForm.data.display_name);
        if (accountForm.data.avatar) {
            formData.append('avatar', accountForm.data.avatar);
        }
        formData.append('_method', 'POST');

        setIsUploadingAvatar(true);
        try {
            await axios.post(route('profile.update'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            router.reload({ only: ['auth'] });
        } catch (err) {
            console.error('Update failed', err);
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const updatePassword = (e) => {
        e.preventDefault();
        passwordForm.post(route('profile.password.update'), {
            onSuccess: () => passwordForm.reset(),
            preserveScroll: true,
        });
    };

    const updateAppearance = (e) => {
        e.preventDefault();
        appearanceForm.patch(route('preferences.update'), {
            preserveScroll: true,
        });
    };

    const tabs = [
        { id: 'account', label: 'Tài khoản', icon: User },
        { id: 'security', label: 'Bảo mật', icon: Shield },
        { id: 'appearance', label: 'Giao diện', icon: Palette },
    ];

    return (
        <BootstrapLayout>
            <Head title="Cài đặt" />
            
            <div className="py-6 max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Glass Sidebar */}
                    <aside className="lg:w-80">
                        <div className="glass-card-settings p-4 space-y-2 rounded-[2.5rem] sticky top-28 border" style={{ borderColor: 'var(--border-color)' }}>
                            <h2 className="px-4 py-2 text-[11px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Cài đặt hệ thống</h2>
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-bold text-sm transition-all border-0 ${activeTab === tab.id ? 'bg-emerald-800 text-white shadow-xl shadow-emerald-800/20' : 'hover:bg-emerald-800/5 bg-transparent'}`}
                                    style={{ color: activeTab === tab.id ? '#fff' : 'var(--text-main)' }}
                                >
                                    <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : 'text-emerald-700'} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Content Area */}
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="glass-card-settings p-8 md:p-12 rounded-[2.5rem]"
                            >
                                {status && (
                                    <div className="mb-8 p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl text-sm font-bold border border-emerald-500/20 flex items-center gap-2">
                                        <CheckCircle2 size={18} /> {status}
                                    </div>
                                )}

                                {activeTab === 'account' && (
                                    <div className="space-y-10">
                                        <div>
                                            <h3 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--text-main)' }}>Thông tin cá nhân</h3>
                                            <p className="font-medium" style={{ color: 'var(--text-muted)' }}>Quản lý cách thông tin của bạn hiển thị trên hệ thống.</p>
                                        </div>

                                        <form onSubmit={updateAccount} className="space-y-8">
                                            <div className="flex flex-col items-center sm:items-start sm:flex-row gap-8">
                                                <div className="relative group">
                                                    <div className="w-32 h-32 overflow-hidden shadow-2xl transition-all duration-500 group-hover:scale-105" 
                                                         style={{ 
                                                             borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                                                             border: '4px solid var(--note-primary-color)',
                                                             background: 'var(--bg-card)'
                                                         }}>
                                                        <img 
                                                            src={avatarPreview || (auth.user.avatar ? `/storage/${auth.user.avatar}` : `https://ui-avatars.com/api/?name=${auth.user.display_name}&background=1e3932&color=fff&size=128`)} 
                                                            alt="Avatar" 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <button 
                                                        type="button"
                                                        className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-800 text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-transform border-0"
                                                        onClick={() => avatarInput.current.click()}
                                                    >
                                                        <Camera size={18} />
                                                    </button>
                                                </div>
                                                <div className="flex-1 space-y-4 pt-2">
                                                    <div>
                                                        <h4 className="text-lg font-bold text-slate-900">{auth.user.display_name}</h4>
                                                        <p className="text-sm text-slate-400 font-medium">{auth.user.email}</p>
                                                    </div>
                                                    <input 
                                                        type="file" 
                                                        ref={avatarInput} 
                                                        className="hidden" 
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                accountForm.setData('avatar', file);
                                                                setAvatarPreview(URL.createObjectURL(file));
                                                            }
                                                        }}
                                                    />
                                                    {accountForm.data.avatar && (
                                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">
                                                            <CheckCircle2 size={12} /> {accountForm.data.avatar.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[13px] font-bold text-slate-700 ml-1 uppercase tracking-wider opacity-60">Tên hiển thị</label>
                                                <input 
                                                    type="text" 
                                                    className="w-full px-6 py-4 bg-white/50 border border-slate-200 rounded-2xl text-slate-900 font-bold placeholder:text-slate-400 focus:ring-4 focus:ring-emerald-700/5 focus:border-emerald-700 transition-all shadow-sm"
                                                    value={accountForm.data.display_name}
                                                    onChange={(e) => accountForm.setData('display_name', e.target.value)}
                                                />
                                                {accountForm.errors.display_name && <p className="text-xs text-rose-500 font-bold ml-1">{accountForm.errors.display_name}</p>}
                                            </div>

                                            <div className="pt-4">
                                                <button type="submit" className="px-10 py-4 bg-emerald-800 text-white rounded-2xl font-extrabold shadow-xl shadow-emerald-800/20 hover:bg-emerald-900 transition-all border-0 disabled:opacity-70" disabled={isUploadingAvatar}>
                                                    {isUploadingAvatar ? <Loader2 size={20} className="animate-spin" /> : 'Lưu thay đổi'}
                                                </button>
                                            </div>
                                        </form>

                                        <div className="pt-10 mt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900">Quản lý phiên đăng nhập</h4>
                                                <p className="text-xs text-slate-400 font-medium">Đăng xuất khỏi NotePro trên thiết bị này.</p>
                                            </div>
                                            <Link 
                                                href={route('logout')} 
                                                method="post" 
                                                as="button" 
                                                className="px-6 py-3 bg-rose-50 text-rose-500 rounded-2xl font-bold text-sm hover:bg-rose-100 transition-all border-0 flex items-center gap-2"
                                            >
                                                <LogOut size={16} /> Đăng xuất ngay
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="space-y-10">
                                        <div>
                                            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Bảo mật</h3>
                                            <p className="text-slate-500 font-medium">Bảo vệ tài khoản của bạn với mật khẩu mạnh.</p>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[13px] font-bold text-slate-700 ml-1 uppercase tracking-wider opacity-60">Địa chỉ Email</label>
                                                <div className="relative">
                                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                                                        <Mail size={18} />
                                                    </div>
                                                    <input type="email" className="w-full pl-14 pr-6 py-4 bg-slate-100/50 border-0 rounded-2xl text-slate-400 font-bold cursor-not-allowed" value={auth.user.email} disabled />
                                                </div>
                                            </div>

                                            <hr className="my-10 border-slate-100" />

                                            <form onSubmit={updatePassword} className="space-y-6">
                                                <h4 className="text-lg font-bold text-slate-900">Thay đổi mật khẩu</h4>
                                                
                                                <div className="space-y-2">
                                                    <label className="text-[13px] font-bold text-slate-700 ml-1 uppercase tracking-wider opacity-60">Mật khẩu hiện tại</label>
                                                    <div className="relative group">
                                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-700 transition-colors">
                                                            <Lock size={18} />
                                                        </div>
                                                        <input 
                                                            type="password" 
                                                            className="w-full pl-14 pr-6 py-4 bg-white/50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-emerald-700/5 focus:border-emerald-700 transition-all shadow-sm"
                                                            value={passwordForm.data.current_password}
                                                            onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                                        />
                                                    </div>
                                                    {passwordForm.errors.current_password && <p className="text-xs text-rose-500 font-bold ml-1">{passwordForm.errors.current_password}</p>}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[13px] font-bold text-slate-700 ml-1 uppercase tracking-wider opacity-60">Mật khẩu mới</label>
                                                        <input 
                                                            type="password" 
                                                            className="w-full px-6 py-4 bg-white/50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-emerald-700/5 focus:border-emerald-700 transition-all shadow-sm"
                                                            value={passwordForm.data.password}
                                                            onChange={(e) => passwordForm.setData('password', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[13px] font-bold text-slate-700 ml-1 uppercase tracking-wider opacity-60">Xác nhận mật khẩu</label>
                                                        <input 
                                                            type="password" 
                                                            className="w-full px-6 py-4 bg-white/50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-emerald-700/5 focus:border-emerald-700 transition-all shadow-sm"
                                                            value={passwordForm.data.password_confirmation}
                                                            onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                {passwordForm.errors.password && <p className="text-xs text-rose-500 font-bold ml-1">{passwordForm.errors.password}</p>}

                                                <div className="pt-4">
                                                    <button type="submit" className="px-10 py-4 bg-emerald-800 text-white rounded-2xl font-extrabold shadow-xl shadow-emerald-800/20 hover:bg-emerald-900 transition-all border-0 disabled:opacity-70" disabled={passwordForm.processing}>
                                                        {passwordForm.processing ? <Loader2 size={20} className="animate-spin" /> : 'Cập nhật mật khẩu'}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'appearance' && (
                                    <div className="space-y-10">
                                        <div>
                                            <h3 className="text-2xl font-extrabold mb-2">Giao diện</h3>
                                            <p className="font-medium">Cá nhân hóa không gian ghi chú của bạn.</p>
                                        </div>

                                        <form onSubmit={updateAppearance} className="space-y-10">
                                            {/* Mode Selector */}
                                            <div className="space-y-4">
                                                <label className="text-[13px] font-bold ml-1 uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-main)', opacity: 0.7 }}>
                                                    <Sun size={14} /> Chế độ hiển thị
                                                </label>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {['light', 'dark'].map((mode) => (
                                                        <label key={mode} className={`relative flex items-center justify-center gap-3 p-5 rounded-[2rem] cursor-pointer transition-all border-2 ${appearanceForm.data.theme === mode ? 'border-emerald-800 bg-emerald-50 text-emerald-800' : 'border-slate-100 bg-white/50 hover:border-slate-200'}`} style={{ color: appearanceForm.data.theme === mode ? '' : 'var(--text-muted)' }}>
                                                            <input type="radio" name="theme" className="sr-only" value={mode} checked={appearanceForm.data.theme === mode} onChange={(e) => appearanceForm.setData('theme', e.target.value)} />
                                                            {mode === 'light' ? <Sun size={20} /> : <Moon size={20} />}
                                                            <span className="font-bold">{mode === 'light' ? 'Sáng' : 'Tối'}</span>
                                                            {appearanceForm.data.theme === mode && <CheckCircle2 size={16} className="absolute top-4 right-4" />}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                {/* Text Color */}
                                                <div className="space-y-4">
                                                    <label className="text-[13px] font-bold ml-1 uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-main)', opacity: 0.7 }}>
                                                        <Pipette size={14} /> Màu chữ ghi chú
                                                    </label>
                                                    <div className="flex items-center gap-4 p-4 bg-white/50 border border-slate-100 rounded-3xl">
                                                        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-inner border border-slate-200 relative">
                                                            <input type="color" className="absolute -inset-2 w-[200%] h-[200%] cursor-pointer" value={appearanceForm.data.text_color} onChange={(e) => appearanceForm.setData('text_color', e.target.value)} />
                                                        </div>
                                                        <span className="font-bold uppercase" style={{ color: 'var(--text-muted)' }}>{appearanceForm.data.text_color}</span>
                                                    </div>
                                                </div>

                                                {/* Color Scheme */}
                                                <div className="space-y-4">
                                                    <label className="text-[13px] font-bold ml-1 uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-main)', opacity: 0.7 }}>
                                                        <Palette size={14} /> Màu ghi chú
                                                    </label>
                                                    <div className="relative group">
                                                        <select 
                                                            className="w-full px-6 py-4 bg-white/50 border border-slate-100 rounded-3xl font-bold focus:ring-4 focus:ring-emerald-700/5 transition-all shadow-sm appearance-none" 
                                                            style={{ color: 'var(--text-main)' }}
                                                            value={appearanceForm.data.color_scheme}
                                                            onChange={(e) => appearanceForm.setData('color_scheme', e.target.value)}
                                                        >
                                                            <option value="blue">Xanh dương</option>
                                                            <option value="green">Xanh lá</option>
                                                            <option value="red">Đỏ</option>
                                                            <option value="orange">Cam</option>
                                                            <option value="purple">Tím</option>
                                                        </select>
                                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                            <Palette size={18} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Font Size */}
                                            <div className="space-y-4">
                                                <label className="text-[13px] font-bold ml-1 uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-main)', opacity: 0.7 }}>
                                                    <Type size={14} /> Kích thước phông chữ
                                                </label>
                                                <div className="bg-slate-100/50 p-1.5 rounded-[2rem] flex items-center gap-1">
                                                    {['small', 'medium', 'large'].map((size) => (
                                                        <button
                                                            key={size}
                                                            type="button"
                                                            className={`flex-1 py-3 rounded-[1.5rem] text-sm font-bold transition-all border-0 ${appearanceForm.data.font_size === size ? 'bg-white text-emerald-800 shadow-sm' : 'bg-transparent hover:opacity-80'}`}
                                                            style={{ color: appearanceForm.data.font_size === size ? '' : 'var(--text-muted)' }}
                                                            onClick={() => appearanceForm.setData('font_size', size)}
                                                        >
                                                            {size === 'small' ? 'Nhỏ' : size === 'medium' ? 'Vừa' : 'Lớn'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="pt-4">
                                                <button type="submit" className="px-10 py-4 bg-emerald-800 text-white rounded-2xl font-extrabold shadow-xl shadow-emerald-800/20 hover:bg-emerald-900 transition-all border-0" disabled={appearanceForm.processing}>
                                                    {appearanceForm.processing ? <Loader2 size={20} className="animate-spin" /> : 'Áp dụng giao diện'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .glass-card-settings {
                    background: var(--bg-card);
                    backdrop-filter: blur(20px) saturate(180%);
                    -webkit-backdrop-filter: blur(20px) saturate(180%);
                    border: 1px solid var(--border-color);
                }

                .glass-card-settings h3, .glass-card-settings h4 { color: var(--text-main); }
                .glass-card-settings p, .glass-card-settings label { color: var(--text-muted); }

                input, select { 
                    background-color: var(--bg-main) !important; 
                    color: var(--text-main) !important;
                    border-color: var(--border-color) !important;
                }
                
                input:focus, select:focus { 
                    border-color: var(--note-primary-color) !important;
                    ring-color: var(--note-primary-color) !important;
                }
                
                input:focus, select:focus { outline: none !important; }
                .no-underline { text-decoration: none !important; }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin { animation: spin 1s linear infinite; }
            `}} />
        </BootstrapLayout>
    );
}
