import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Settings,
    BarChart3,
    CreditCard,
    LogOut,
    Menu,
    X,
    ClipboardCheck,
    Download
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useNotifications } from '../../hooks/useNotifications';
import ThemeToggle from '../common/ThemeToggle';

const Sidebar: React.FC = () => {
    const { user, profile, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const { isInstallable, installApp } = usePWAInstall();
    useNotifications(); // Enable Order Notifications

    const navItems = [
        { to: '/', icon: <LayoutDashboard size={20} />, label: '대시보드' },
        { to: '/items', icon: <Package size={20} />, label: '제품 관리' },
        { to: '/orders', icon: <ShoppingCart size={20} />, label: '주문 관리' },
        { to: '/profit', icon: <BarChart3 size={20} />, label: '수익 분석' },
        { to: '/inventory-check', icon: <ClipboardCheck size={20} />, label: '재고 관리' },
        { to: '/expenses', icon: <CreditCard size={20} />, label: '지출 관리' },
        { to: '/config', icon: <Settings size={20} />, label: '환경 설정' },
    ];

    return (
        <>
            <button
                className={`md:hidden fixed top-4 left-4 z-[110] p-2 glass transition-all flex items-center justify-center ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <aside className={`sidebar glass ${isOpen ? 'open' : ''}`}>
                <div className="flex flex-col h-full">
                    <div className="mb-8 px-4">
                        <h1 className="text-2xl font-bold text-primary tracking-tight">Sobok</h1>
                        <p className="text-xs text-text-muted">Smart Cost Partner</p>
                    </div>

                    <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-primary dark:hover:text-white'
                                    }`
                                }
                                onClick={() => setIsOpen(false)}
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    <div className="mt-4 pt-6 border-t border-white/5 space-y-4">
                        <div className="px-4 space-y-1">
                            <p className="text-xs font-medium text-emerald-400">오늘도 행복이 소복소복 🌸</p>
                            <div className="font-bold text-sm text-text-main truncate">{profile?.company_name || user?.email?.split('@')[0]}님</div>
                            <div className="text-[10px] text-text-muted font-mono">ver 1.0.3</div>
                        </div>

                        <ThemeToggle />

                        {isInstallable && (
                            <button
                                onClick={installApp}
                                className="mx-4 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <Download size={18} />
                                <span>앱 설치하기</span>
                            </button>
                        )}

                        <button
                            onClick={signOut}
                            className="w-full flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">로그아웃</span>
                        </button>
                    </div>
                </div>
            </aside>

            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;
