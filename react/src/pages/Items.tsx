import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useItems } from '../hooks/useItems';
import type { Item, ItemType } from '../types';
import {
    Package,
    Plus,
    Search,
    Edit2,
    Trash2,
    ArrowRight,
    Info,
    ChevronDown,
    Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ItemsPage: React.FC = () => {
    const navigate = useNavigate();
    const { items, loading, fetchItems, saveItem, deleteItem } = useItems();
    const [filter, setFilter] = useState<ItemType | 'All'>('All');
    const [search, setSearch] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<Item> | null>(null);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const filteredItems = items.filter(item => {
        const matchesFilter = filter === 'All' || item.type === filter;
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleOpenForm = (item?: Item) => {
        if (item) {
            setEditingItem(item);
        } else {
            setEditingItem({ type: filter === 'All' ? 'Product' : filter, purchase_qty: 1, usage_qty: 1 });
        }
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingItem(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            await saveItem(editingItem);
            handleCloseForm();
        }
    };

    const getTypeLabel = (type: ItemType) => {
        switch (type) {
            case 'Product': return '완제품';
            case 'Component': return '반제품';
            case 'Material': return '원자재';
            default: return type;
        }
    };

    const getTypeColor = (type: ItemType) => {
        switch (type) {
            case 'Product': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'Component': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'Material': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                        <Package className="text-primary" size={40} />
                        품목 및 원가 관리
                    </h1>
                    <p className="text-text-muted">원자재부터 완제품까지, 체계적인 레시피 관리를 시작하세요.</p>
                </div>
                <button onClick={() => handleOpenForm()} className="btn btn-primary h-14 px-8 rounded-2xl shadow-xl shadow-primary/20">
                    <Plus size={24} />
                    <span>새 품목 등록</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3 space-y-6">
                    {/* Filters & Search */}
                    <div className="glass p-2 flex flex-col md:flex-row gap-2">
                        <div className="flex-1 flex gap-2">
                            {(['All', 'Product', 'Component', 'Material'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setFilter(t)}
                                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${filter === t ? 'bg-white/10 text-white' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
                                >
                                    {t === 'All' ? '전체' : getTypeLabel(t)}
                                </button>
                            ))}
                        </div>
                        <div className="relative md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                            <input
                                type="text"
                                className="input-field pl-12 h-full"
                                placeholder="품목 검색..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Items Table/List */}
                    <div className="glass overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 text-xs font-bold text-text-muted uppercase tracking-wider">
                                        <th className="px-6 py-5">유형</th>
                                        <th className="px-6 py-5">품목 명칭</th>
                                        <th className="px-6 py-5 text-right">단가 / 판매가</th>
                                        <th className="px-6 py-5 text-right">관리</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                                    <p className="text-text-muted font-medium">데이터를 불러오는 중...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-20 text-center">
                                                <p className="text-text-muted font-medium">등록된 품목이 없습니다.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredItems.map((item) => (
                                            <motion.tr
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                key={item.id}
                                                className="group hover:bg-white/[0.02] transition-colors"
                                            >
                                                <td className="px-6 py-5">
                                                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getTypeColor(item.type)}`}>
                                                        {getTypeLabel(item.type)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="font-bold text-lg">{item.name}</div>
                                                    {item.remarks && <div className="text-xs text-text-muted mt-1">{item.remarks}</div>}
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="font-mono font-bold text-lg">
                                                        {item.type === 'Material' ? (
                                                            <span className="text-blue-400">{item.cost_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}원<small className="ml-1 text-[10px] opacity-50">/g</small></span>
                                                        ) : (
                                                            <span className="text-emerald-400">{item.selling_price.toLocaleString()}원</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex justify-end gap-2">
                                                        {item.type !== 'Material' && (
                                                            <button
                                                                onClick={() => navigate(`/items/${item.id}`)}
                                                                className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                                                            >
                                                                <Layers size={18} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleOpenForm(item)}
                                                            className="p-2.5 rounded-xl bg-white/5 text-text-muted hover:bg-white/10 hover:text-white transition-all"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => { if (confirm('삭제하시겠습니까?')) deleteItem(item.id) }}
                                                            className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass p-6 border-l-4 border-l-primary">
                        <h3 className="font-bold mb-2 flex items-center gap-2">
                            <Info size={18} className="text-primary" />
                            스마트 원가 팁
                        </h3>
                        <p className="text-sm text-text-muted leading-relaxed">
                            원자재를 먼저 등록하세요. 반제품이나 완제품을 만들 때 미리 등록한 원자재를 선택하여 정확한 원가를 계산할 수 있습니다.
                        </p>
                    </div>

                    <div className="glass p-6">
                        <h3 className="font-bold mb-4 opacity-50">상태 요약</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-text-muted">전체 품목</span>
                                <span className="font-mono font-bold">{items.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-text-muted">진행중인 상품</span>
                                <span className="font-mono font-bold text-emerald-400">{items.filter(i => i.type === 'Product').length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Modal */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-12">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseForm}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-2xl glass p-8 relative z-10"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Edit2 className="text-primary" size={24} />
                                    </div>
                                    {editingItem?.id ? '품목 정보 수정' : '새 품목 등록'}
                                </h2>
                                <button onClick={handleCloseForm} className="text-text-muted hover:text-white">
                                    <ChevronDown size={32} className="rotate-90 md:rotate-0" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">유형</label>
                                        <select
                                            className="input-field"
                                            value={editingItem?.type}
                                            onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as ItemType })}
                                        >
                                            <option value="Product">🎁 완제품</option>
                                            <option value="Component">🍰 반제품</option>
                                            <option value="Material">📦 원자재</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">품목 명칭</label>
                                        <input
                                            required
                                            type="text"
                                            className="input-field"
                                            placeholder="이름을 입력하세요"
                                            value={editingItem?.name || ''}
                                            onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {editingItem?.type === 'Material' ? (
                                    <div className="p-6 bg-white/5 rounded-2xl space-y-6 border border-white/5">
                                        <p className="text-sm font-bold text-primary flex items-center gap-2">
                                            <ArrowRight size={14} /> 구매 정보 (원가 자동 계산용)
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-text-muted">총 구매가 (원)</label>
                                                <input
                                                    type="number"
                                                    className="input-field"
                                                    placeholder="0"
                                                    value={editingItem?.purchase_price || 0}
                                                    onChange={(e) => setEditingItem({ ...editingItem, purchase_price: Number(e.target.value) })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-text-muted">구매 용량 (g/ml)</label>
                                                <input
                                                    type="number"
                                                    className="input-field"
                                                    placeholder="1"
                                                    value={editingItem?.purchase_qty || 1}
                                                    onChange={(e) => setEditingItem({ ...editingItem, purchase_qty: Number(e.target.value) })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-text-muted">실제 가용량 (%)</label>
                                                <input
                                                    type="number"
                                                    className="input-field"
                                                    placeholder="1"
                                                    value={editingItem?.usage_qty || 1}
                                                    onChange={(e) => setEditingItem({ ...editingItem, usage_qty: Number(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">판매가 (원)</label>
                                        <input
                                            type="number"
                                            className="input-field text-xl font-bold text-emerald-400"
                                            placeholder="0"
                                            value={editingItem?.selling_price || 0}
                                            onChange={(e) => setEditingItem({ ...editingItem, selling_price: Number(e.target.value) })}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">비고 / 참고사항</label>
                                    <textarea
                                        className="input-field min-h-[100px] py-4"
                                        placeholder="재료 정보나 특징을 기록하세요"
                                        value={editingItem?.remarks || ''}
                                        onChange={(e) => setEditingItem({ ...editingItem, remarks: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={handleCloseForm} className="btn flex-1 py-4 bg-white/5 hover:bg-white/10 text-white">취소</button>
                                    <button type="submit" className="btn btn-primary flex-1 py-4 shadow-lg shadow-primary/20">품목 저장하기</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ItemsPage;
