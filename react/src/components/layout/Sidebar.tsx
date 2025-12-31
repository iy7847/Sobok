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
    X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
    const { signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { to: '/', icon: <LayoutDashboard size={20} />, label: '대시보드' },
        { to: '/items', icon: <Package size={20} />, label: '품목/원가 관리' },
        { to: '/orders', icon: <ShoppingCart size={20} />, label: '주문 관리' },
        { to: '/profit', icon: <BarChart3 size={20} />, label: '수익 분석' },
        { to: '/expenses', icon: <CreditCard size={20} />, label: '지출/고정비' },
        { to: '/config', icon: <Settings size={20} />, label: '주문서 설정' },
    ];

    return (
        <>
            <button
                className="md:hidden fixed top-4 left-4 z-[110] p-2 glass"
                onClick={() => setIsOpen(!isOpen)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <aside className={`sidebar glass ${isOpen ? 'open' : ''}`}>
                <div className="flex flex-col h-full">
                    <div className="mb-10 px-4">
                        <h1 className="text-2xl font-bold text-primary tracking-tight">Sobok</h1>
                        <p className="text-xs text-text-muted">Smart Cost Partner</p>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:bg-white/5 hover:text-white'
                                    }`
                                }
                                onClick={() => setIsOpen(false)}
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    <button
                        onClick={signOut}
                        className="flex items-center gap-3 px-4 py-3 mt-auto text-text-muted hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">로그아웃</span>
                    </button>
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
