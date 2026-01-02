import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Info,
    TrendingUp,
    Target,
    Scale,
    DollarSign,
    Box,
    ShoppingCart,
    CreditCard,
    ClipboardCheck,
    Settings,
    LayoutDashboard
} from 'lucide-react';
import { useGuide } from '../../hooks/useGuide';
import Button from '../ui/Button';
import { RefreshCw } from 'lucide-react';

interface GuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    pageId: string;
    title?: string;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose, pageId, title = "도움말 & 가이드" }) => {
    const { guides, fetchGuides, loading } = useGuide(pageId);

    useEffect(() => {
        if (isOpen && guides.length === 0) {
            fetchGuides();
        }
    }, [isOpen, pageId, guides.length, fetchGuides]);

    const getIcon = (name: string | undefined) => {
        switch (name) {
            case 'TrendingUp': return <TrendingUp size={24} className="text-primary" />;
            case 'Target': return <Target size={24} className="text-emerald-500" />;
            case 'Scale': return <Scale size={24} className="text-amber-500" />;
            case 'DollarSign': return <DollarSign size={24} className="text-blue-500" />;
            case 'Box': return <Box size={24} className="text-indigo-500" />;
            case 'ShoppingCart': return <ShoppingCart size={24} className="text-purple-500" />;
            case 'CreditCard': return <CreditCard size={24} className="text-rose-500" />;
            case 'ClipboardCheck': return <ClipboardCheck size={24} className="text-cyan-500" />;
            case 'Settings': return <Settings size={24} className="text-slate-500" />;
            case 'LayoutDashboard': return <LayoutDashboard size={24} className="text-orange-500" />;
            default: return <Info size={24} className="text-text-muted" />;
        }
    };

    const borderColors = [
        'border-primary',
        'border-emerald-500',
        'border-amber-500',
        'border-blue-500',
        'border-indigo-500',
        'border-purple-500'
    ];

    const bgColors = [
        'bg-gray-50 dark:bg-white/5',
        'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
        'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
        'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
        'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400'
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="sticky top-0 p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-white/95 dark:bg-zinc-900/95 backdrop-blur z-10">
                            <h3 className="text-xl font-black text-text-main flex items-center gap-2">
                                <Info className="text-primary" size={24} />
                                {title}
                            </h3>
                            <button onClick={onClose} className="text-text-muted hover:text-text-main transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-8 min-h-[200px]">
                            {loading && guides.length === 0 ? (
                                <div className="text-center py-10 text-text-muted">
                                    <RefreshCw className="animate-spin mx-auto mb-2" />
                                    조금만 기다려주세요...
                                </div>
                            ) : guides.length === 0 ? (
                                <div className="text-center py-10 text-text-muted bg-gray-50 dark:bg-white/5 rounded-xl">
                                    <Info className="mx-auto mb-2 opacity-50" size={32} />
                                    아직 등록된 가이드가 없습니다.
                                </div>
                            ) : (
                                guides.map((guide, index) => (
                                    <div key={guide.id} className="space-y-3">
                                        <h4 className={`font-bold text-lg text-text-main border-l-4 ${borderColors[index % borderColors.length]} pl-3 flex items-center gap-2`}>
                                            {getIcon(guide.icon_name)}
                                            {guide.title}
                                        </h4>
                                        <div className={`${bgColors[index % bgColors.length]} p-4 rounded-xl text-sm whitespace-pre-wrap leading-relaxed`}>
                                            {guide.content}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-6 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 text-center">
                            <Button onClick={onClose} className="w-full md:w-auto px-8">
                                확인했습니다
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
