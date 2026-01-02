import React, { useState } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import {
    Package,
    Layers,
    Box,
    ShoppingCart,
    ArrowRight,
    Sparkles,
    TrendingUp,
    Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GuideButton } from '../components/common/GuideButton';
import { GuideModal } from '../components/common/GuideModal';

const Dashboard: React.FC = () => {
    const { stats, loading } = useDashboard();
    const [showGuide, setShowGuide] = useState(false);

    const cards = [
        {
            label: '판매 제품',
            value: stats.products,
            icon: <Package size={32} />,
            color: 'bg-emerald-500',
            link: '/items',
            desc: '고객에게 판매되는 최종 상품'
        },
        {
            label: '반제품',
            value: stats.components,
            icon: <Layers size={32} />,
            color: 'bg-amber-500',
            link: '/items',
            desc: '제품의 구성 요소가 되는 중간재'
        },
        {
            label: '재료',
            value: stats.materials,
            icon: <Box size={32} />,
            color: 'bg-slate-500',
            link: '/items',
            desc: '구매하여 사용하는 기본 재료'
        },
        {
            label: '진행 중인 주문',
            value: stats.activeOrders,
            icon: <ShoppingCart size={32} />,
            color: 'bg-primary',
            link: '/orders',
            desc: '현재 처리 중인 활성 주문 건수'
        }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 pb-20">
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-transparent p-8 md:p-12 lg:p-20 border border-white/5">
                <div className="relative z-10 max-w-2xl space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-black uppercase tracking-widest"
                    >
                        <Sparkles size={14} /> Welcome to Sobok
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-text-main leading-tight"
                    >
                        소복, 복잡함은 덜고 <br />
                        <span className="text-primary italic">이익은 채우고</span>
                        <GuideButton onClick={() => setShowGuide(true)} className="ml-3 align-middle" />
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-text-muted text-lg font-medium leading-relaxed"
                    >
                        수익 분석부터 주문 관리까지, <br />
                        당신의 비즈니스를 더 스마트하게 관리하세요.
                    </motion.p>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full" />
            </section>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, index) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                    >
                        <Link
                            to={card.link}
                            className="glass group block h-full p-6 md:p-8 space-y-6 hover:border-primary/30 transition-all duration-500"
                        >
                            <div className="flex justify-between items-start">
                                <div className={`p-4 rounded-2xl ${card.color} bg-opacity-10 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                                    <div className={`text-${card.color.split('-')[1]}-400`}>
                                        {card.icon}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-black text-text-muted uppercase tracking-widest">
                                    Detail <ArrowRight size={10} />
                                </div>
                            </div>

                            <div className="space-y-1">
                                {loading ? (
                                    <div className="h-12 w-20 bg-white/5 animate-pulse rounded-xl" />
                                ) : (
                                    <h2 className="text-4xl md:text-5xl font-black text-text-main tracking-tighter">
                                        {card.value}
                                    </h2>
                                )}
                                <p className="text-sm font-bold text-text-muted uppercase">{card.label}</p>
                            </div>

                            <p className="text-xs text-text-muted/60 font-medium leading-relaxed border-t border-white/5 pt-4">
                                {card.desc}
                            </p>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions / Integration Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="glass p-6 md:p-10 space-y-6 bg-gradient-to-br from-white/5 to-transparent"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/20 rounded-2xl text-primary"><TrendingUp size={24} /></div>
                        <h3 className="text-2xl font-black">실시간 이익 분석</h3>
                    </div>
                    <p className="text-text-muted font-medium italic">"재료비 변동에 따른 마진 변화를 확인하셨나요?"</p>
                    <p className="text-text-muted leading-relaxed">
                        등록된 BOM 정보를 바탕으로 현재 판매 중인 모든 제품의 원가를 실시간으로 계산합니다.
                        수익성을 개선하기 위한 최적의 판매가를 분석하세요.
                    </p>
                    <Link to="/profit" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all">
                        수익 분석 메뉴로 이동 <ArrowRight size={18} />
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                    className="glass p-6 md:p-10 space-y-6 bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/10"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400"><Clock size={24} /></div>
                        <h3 className="text-2xl font-black">주문 및 지출 최적화</h3>
                    </div>
                    <p className="text-text-muted font-medium italic">"고정비와 지출을 체계적으로 관리하세요."</p>
                    <p className="text-text-muted leading-relaxed">
                        누락되는 지출 없이 모든 운영비를 기록하여 정확한 영업이익을 산출합니다.
                        디자인된 온라인 주문서로 고객과의 접점을 늘리고 매출을 통합 관리하세요.
                    </p>
                    <Link to="/expenses" className="inline-flex items-center gap-2 text-emerald-400 font-bold hover:gap-4 transition-all">
                        지출 관리 메뉴로 이동 <ArrowRight size={18} />
                    </Link>
                </motion.div>
            </div>


            <GuideModal
                isOpen={showGuide}
                onClose={() => setShowGuide(false)}
                pageId="dashboard"
                title="대시보드 가이드"
            />
        </div >
    );
};

export default Dashboard;
