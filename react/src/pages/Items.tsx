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
    Layers,
    AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NumberInput } from '../components/common/NumberInput';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';

const ItemsPage: React.FC = () => {
    const navigate = useNavigate();
    const { items, loading, error, fetchItems, saveItem, deleteItem } = useItems();
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
            setEditingItem({ type: filter === 'All' ? 'Product' : filter, purchase_qty: 1, usage_qty: 100 });
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
                    <h1 className="text-4xl font-black mb-2 flex items-center gap-3 text-text-main">
                        <Package className="text-primary" size={40} />
                        품목 및 원가 관리
                    </h1>
                    <p className="text-text-muted">원자재부터 완제품까지, 체계적인 레시피 관리를 시작하세요.</p>
                </div>
                <Button
                    onClick={() => handleOpenForm()}
                    variant="primary"
                    className="h-14 px-8 shadow-xl shadow-primary/20"
                    leftIcon={<Plus size={24} />}
                >
                    새 품목 등록
                </Button>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400"
                >
                    <AlertTriangle size={24} />
                    <p className="font-medium">{error}</p>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3 space-y-6">
                    {/* Filters & Search */}
                    <Card variant="glass" className="p-2 flex flex-col md:flex-row gap-2">
                        <div className="flex-1 flex gap-2 overflow-x-auto p-1">
                            {(['All', 'Product', 'Component', 'Material'] as const).map((t) => (
                                <Button
                                    key={t}
                                    variant="secondary"
                                    onClick={() => setFilter(t)}
                                    isSelected={filter === t}
                                    className="flex-1"
                                >
                                    {t === 'All' ? '전체' : getTypeLabel(t)}
                                </Button>
                            ))}
                        </div>
                        <div className="md:w-64">
                            <Input
                                placeholder="품목 검색..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                leftIcon={<Search size={18} />}
                                containerClassName="!space-y-0 h-full"
                                className="h-full"
                            />
                        </div>
                    </Card>

                    {/* Items List */}
                    <Card variant="glass" className="!p-0 overflow-hidden">
                        {/* Desktop Table Header */}
                        <div className="hidden md:grid grid-cols-[1fr_2fr_1fr_1fr] gap-4 px-6 py-4 border-b border-gray-200 dark:border-white/5 text-[10px] font-black text-text-muted uppercase tracking-widest bg-gray-50 dark:bg-white/[0.02]">
                            <div>유형</div>
                            <div>품목 명칭</div>
                            <div className="text-right">단가 / 판매가</div>
                            <div className="text-right">관리</div>
                        </div>

                        {/* Content */}
                        <div className="divide-y divide-gray-200 dark:divide-white/5">
                            {loading ? (
                                <div className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                        <p className="text-text-muted font-medium">데이터를 불러오는 중...</p>
                                    </div>
                                </div>
                            ) : filteredItems.length === 0 ? (
                                <div className="py-20 text-center">
                                    <p className="text-text-muted font-medium">등록된 품목이 없습니다.</p>
                                </div>
                            ) : (
                                filteredItems.map((item) => (
                                    <React.Fragment key={item.id}>
                                        {/* Mobile Card View */}
                                        <div className="md:hidden p-5 space-y-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-2 items-center">
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md border flex items-center gap-1 ${getTypeColor(item.type)}`}>
                                                        {item.type === 'Product' && '🎁'}
                                                        {item.type === 'Component' && '🍰'}
                                                        {item.type === 'Material' && '📦'}
                                                        {getTypeLabel(item.type)}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    {item.type !== 'Material' && (
                                                        <Button
                                                            size="icon"
                                                            variant="secondary"
                                                            onClick={() => navigate(`/items/${item.id}`)}
                                                            title="BOM 관리"
                                                        >
                                                            <Layers size={16} />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => handleOpenForm(item)}
                                                    >
                                                        <Edit2 size={16} />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="danger"
                                                        onClick={() => { if (confirm('삭제하시겠습니까?')) deleteItem(item.id) }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="font-bold text-lg text-text-main">{item.name}</div>
                                                {item.remarks && <div className="text-xs text-text-muted mt-1">{item.remarks}</div>}
                                            </div>

                                            <div className="flex justify-between items-center p-3 rounded-lg bg-gray-100 dark:bg-white/5 text-text-main">
                                                <span className="text-xs font-bold text-text-muted">가격 정보</span>
                                                <div className="font-mono font-bold text-lg flex flex-col items-end">
                                                    {item.type === 'Material' ? (
                                                        <span className="text-blue-500 dark:text-blue-400">{item.cost_price.toLocaleString(undefined, { minimumFractionDigits: 0 })}원<small className="ml-1 text-[10px] opacity-70">/{item.purchase_unit || 'g'}</small></span>
                                                    ) : (
                                                        <div className="text-right">
                                                            <div className="text-emerald-500 dark:text-emerald-400">{item.selling_price.toLocaleString()}원</div>
                                                            <div className="text-[10px] text-text-muted font-normal">
                                                                원가: {item.cost_price ? item.cost_price.toLocaleString() : 0}원
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Desktop Table Row */}
                                        <div className="hidden md:grid grid-cols-[1fr_2fr_1fr_1fr] gap-4 px-6 py-5 items-center hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                                            <div>
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${getTypeColor(item.type)}`}>
                                                    {getTypeLabel(item.type)}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="font-bold text-lg text-text-main">{item.name}</div>
                                                {item.remarks && <div className="text-xs text-text-muted mt-1">{item.remarks}</div>}
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono font-bold text-lg flex flex-col items-end">
                                                    {item.type === 'Material' ? (
                                                        <span className="text-blue-500 dark:text-blue-400">{item.cost_price.toLocaleString(undefined, { minimumFractionDigits: 0 })}원<small className="ml-1 text-[10px] opacity-70">/{item.purchase_unit || 'g'}</small></span>
                                                    ) : (
                                                        <>
                                                            <span className="text-emerald-500 dark:text-emerald-400">{item.selling_price.toLocaleString()}원</span>
                                                            <span className="text-[10px] text-text-muted font-normal">
                                                                원가: {item.cost_price ? item.cost_price.toLocaleString() : 0}원
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {item.type !== 'Material' && (
                                                        <Button
                                                            size="icon"
                                                            variant="secondary"
                                                            onClick={() => navigate(`/items/${item.id}`)}
                                                        >
                                                            <Layers size={18} />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => handleOpenForm(item)}
                                                    >
                                                        <Edit2 size={18} />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="danger"
                                                        onClick={() => { if (confirm('삭제하시겠습니까?')) deleteItem(item.id) }}
                                                    >
                                                        <Trash2 size={18} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card variant="glass" className="p-6 border-l-4 border-l-primary">
                        <h3 className="font-bold mb-2 flex items-center gap-2 text-text-main">
                            <Info size={18} className="text-primary" />
                            스마트 원가 팁
                        </h3>
                        <p className="text-sm text-text-muted leading-relaxed">
                            원자재를 먼저 등록하세요. 반제품이나 완제품을 만들 때 미리 등록한 원자재를 선택하여 정확한 원가를 계산할 수 있습니다.
                        </p>
                    </Card>

                    <Card variant="glass" className="p-6">
                        <h3 className="font-bold mb-4 opacity-50 text-text-main">상태 요약</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-text-muted">전체 품목</span>
                                <span className="font-mono font-bold text-text-main">{items.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-text-muted">진행중인 상품</span>
                                <span className="font-mono font-bold text-emerald-400">{items.filter(i => i.type === 'Product').length}</span>
                            </div>
                        </div>
                    </Card>
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
                            className="w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-8 relative z-10 max-h-[85vh] overflow-y-auto shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold flex items-center gap-3 text-text-main">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Edit2 className="text-primary" size={24} />
                                    </div>
                                    {editingItem?.id ? '품목 정보 수정' : '새 품목 등록'}
                                </h2>
                                <button onClick={handleCloseForm} className="text-text-muted hover:text-text-main">
                                    <ChevronDown size={32} className="rotate-90 md:rotate-0" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Select
                                        label="유형"
                                        value={editingItem?.type || 'Product'}
                                        onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as ItemType })}
                                        options={[
                                            { value: 'Product', label: '🎁 완제품' },
                                            { value: 'Component', label: '🍰 반제품' },
                                            { value: 'Material', label: '📦 원자재' }
                                        ]}
                                    />
                                    <Input
                                        label="품목 명칭"
                                        required
                                        placeholder="이름을 입력하세요"
                                        value={editingItem?.name || ''}
                                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                    />
                                </div>

                                {editingItem?.type === 'Material' ? (
                                    <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-2xl space-y-6 border border-gray-200 dark:border-white/5">
                                        <p className="text-sm font-bold text-primary flex items-center gap-2">
                                            <ArrowRight size={14} /> 구매 정보 (원가 자동 계산용)
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-text-muted">총 구매가 (원)</label>
                                                <NumberInput
                                                    className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg h-10 px-3 font-bold"
                                                    placeholder="0"
                                                    value={editingItem?.purchase_price || 0}
                                                    onChange={(val) => setEditingItem({ ...editingItem, purchase_price: val })}
                                                />
                                                <p className="text-xs text-text-muted/70">배송비 포함 총 지불 금액</p>
                                            </div>
                                            <div className="md:col-span-2 space-y-2 min-w-0">
                                                <label className="text-xs font-bold text-text-muted">구매 용량 (g/ml)</label>
                                                <div className="flex gap-2">
                                                    <NumberInput
                                                        className="flex-1 min-w-0 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg h-10 px-3"
                                                        placeholder="1"
                                                        value={editingItem?.purchase_qty || 1}
                                                        onChange={(val) => setEditingItem({ ...editingItem, purchase_qty: val })}
                                                    />
                                                    <Select
                                                        value={editingItem?.purchase_unit || 'g'}
                                                        onChange={(e) => setEditingItem({ ...editingItem, purchase_unit: e.target.value })}
                                                        containerClassName="!space-y-0 w-20 md:w-24 shrink-0"
                                                        className="h-10"
                                                        options={[
                                                            { value: 'g', label: 'g' },
                                                            { value: 'ml', label: 'ml' },
                                                            { value: 'ea', label: 'ea' },
                                                            { value: 'mm', label: 'mm' }
                                                        ]}
                                                    />
                                                </div>
                                                <p className="text-xs text-text-muted/70">포장지에 적힌 총 용량/개수</p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-text-muted">실제 가용량 (%)</label>
                                                <NumberInput
                                                    className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg h-10 px-3"
                                                    placeholder="100"
                                                    value={editingItem?.usage_qty || 100}
                                                    onChange={(val) => setEditingItem({ ...editingItem, usage_qty: val })}
                                                />
                                                <p className="text-xs text-text-muted/70">손질 후 남는 비율 (100=로스없음)</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">판매가 (원)</label>
                                        <NumberInput
                                            className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg h-12 px-4 text-xl font-bold text-emerald-500 dark:text-emerald-400"
                                            placeholder="0"
                                            value={editingItem?.selling_price || 0}
                                            onChange={(val) => setEditingItem({ ...editingItem, selling_price: val })}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">비고 / 참고사항</label>
                                    <textarea
                                        className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg min-h-[100px] p-4 text-text-main focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-text-muted/50"
                                        placeholder="재료 정보나 특징을 기록하세요"
                                        value={editingItem?.remarks || ''}
                                        onChange={(e) => setEditingItem({ ...editingItem, remarks: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={handleCloseForm}
                                        className="flex-1 h-12"
                                    >
                                        취소
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="flex-1 h-12 shadow-lg shadow-primary/20"
                                    >
                                        품목 저장하기
                                    </Button>
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
