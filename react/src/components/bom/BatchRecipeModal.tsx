
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Calculator, Search, ArrowRight } from 'lucide-react';
import type { Item, ItemType } from '../../types';
import { NumberInput } from '../common/NumberInput';

interface BatchRecipeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (items: { item: Item; unitQty: number }[]) => void;
    availableItems: Item[];
}

interface BatchIngredient {
    item: Item;
    batchQty: number;
}

export const BatchRecipeModal: React.FC<BatchRecipeModalProps> = ({
    isOpen,
    onClose,
    onApply,
    availableItems
}) => {
    const [productionQty, setProductionQty] = useState<number>(1);
    const [batchIngredients, setBatchIngredients] = useState<BatchIngredient[]>([]);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<ItemType>('Material');
    const [selectedItemToAdd, setSelectedItemToAdd] = useState<Item | null>(null);
    const [addBatchQty, setAddBatchQty] = useState<number>(0);

    const filteredSearchResults = useMemo(() => {
        return availableItems.filter(item =>
            (item.type === filterType) &&
            (item.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
            (!batchIngredients.some(bi => bi.item.id === item.id))
        );
    }, [availableItems, filterType, searchQuery, batchIngredients]);

    const handleAddIngredient = () => {
        if (!selectedItemToAdd || addBatchQty <= 0) return;

        setBatchIngredients(prev => [...prev, {
            item: selectedItemToAdd,
            batchQty: addBatchQty
        }]);

        setSelectedItemToAdd(null);
        setAddBatchQty(0);
        setSearchQuery('');
    };

    const handleRemoveIngredient = (itemId: number) => {
        setBatchIngredients(prev => prev.filter(bi => bi.item.id !== itemId));
    };

    const handleUpdateBatchQty = (itemId: number, newQty: number) => {
        setBatchIngredients(prev => prev.map(bi =>
            bi.item.id === itemId ? { ...bi, batchQty: newQty } : bi
        ));
    };

    const handleApply = () => {
        if (productionQty <= 0) {
            alert('생산 수량은 0보다 커야 합니다.');
            return;
        }

        const calculatedItems = batchIngredients.map(bi => ({
            item: bi.item,
            unitQty: Number((bi.batchQty / productionQty).toFixed(4)) // Keep precision
        }));

        onApply(calculatedItems);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-[#1e1e1e] rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                <Calculator size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black">일괄 BOM 계산기</h2>
                                <p className="text-sm text-text-muted">전체 배합표를 입력하면 1개 단위 소요량을 자동으로 계산합니다.</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                        {/* Left: Input & Search */}
                        <div className="p-6 overflow-y-auto border-r border-gray-100 dark:border-white/5 space-y-8">

                            {/* Step 1: Production Qty */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">1</span>
                                    총 생산 수량 (Total Yield)
                                </label>
                                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <NumberInput
                                            className="flex-1 h-12 text-lg font-bold text-center bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl"
                                            value={productionQty}
                                            onChange={setProductionQty}
                                            placeholder="예: 10개"
                                        />
                                        <span className="text-sm font-bold text-text-muted">개 생산 기준</span>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Add Ingredients */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">2</span>
                                    배합 재료 추가
                                </label>

                                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl space-y-4">
                                    <div className="flex gap-2 p-1 bg-white dark:bg-black/20 rounded-lg border border-gray-200 dark:border-white/5">
                                        <button
                                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${filterType === 'Material' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:bg-gray-100 dark:hover:bg-white/5'}`}
                                            onClick={() => setFilterType('Material')}
                                        >
                                            재료 (Material)
                                        </button>
                                        <button
                                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${filterType === 'Component' ? 'bg-amber-500 text-white shadow-md' : 'text-text-muted hover:bg-gray-100 dark:hover:bg-white/5'}`}
                                            onClick={() => setFilterType('Component')}
                                        >
                                            반제품 (Component)
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                                        <input
                                            type="text"
                                            className="w-full h-10 pl-10 pr-3 text-sm bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:border-primary outline-none"
                                            placeholder="재료 검색..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    <div className="max-h-[200px] overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                                        {filteredSearchResults.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => setSelectedItemToAdd(item)}
                                                className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${selectedItemToAdd?.id === item.id ? 'bg-primary text-white' : 'bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-transparent hover:border-primary/20'}`}
                                            >
                                                <span className="font-bold text-sm">{item.name}</span>
                                                <span className={`text-[10px] ${selectedItemToAdd?.id === item.id ? 'text-white/80' : 'text-text-muted'}`}>{item.purchase_unit}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {selectedItemToAdd && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-3"
                                        >
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-bold text-primary">{selectedItemToAdd.name}</span>
                                                <button onClick={() => setSelectedItemToAdd(null)} className="text-text-muted hover:text-red-500"><X size={14} /></button>
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                <NumberInput
                                                    className="flex-1 h-9 text-sm text-right bg-white dark:bg-white/10 border border-primary/20 rounded-lg px-2"
                                                    placeholder="배합량"
                                                    value={addBatchQty}
                                                    onChange={setAddBatchQty}
                                                />
                                                <span className="text-xs text-text-muted w-8">{selectedItemToAdd.purchase_unit}</span>
                                                <button
                                                    onClick={handleAddIngredient}
                                                    className="h-9 px-4 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-dark transition-colors"
                                                >
                                                    추가
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Review & Calculate */}
                        <div className="flex flex-col bg-gray-50/50 dark:bg-black/20">
                            <div className="p-6 border-b border-gray-100 dark:border-white/5">
                                <h3 className="font-bold text-lg mb-1">계산 결과 미리보기</h3>
                                <p className="text-xs text-text-muted">총 {productionQty}개 생산 시 1개당 소요되는 양입니다.</p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-2">
                                {batchIngredients.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-text-muted/50 space-y-3">
                                        <Calculator size={48} className="opacity-20" />
                                        <p className="text-sm">왼쪽에서 재료를 추가해주세요.</p>
                                    </div>
                                ) : (
                                    batchIngredients.map((bi) => (
                                        <motion.div
                                            key={bi.item.id}
                                            layout
                                            className="bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm group"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${bi.item.type === 'Component' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                                                    <span className="font-bold text-sm">{bi.item.name}</span>
                                                </div>
                                                <button onClick={() => handleRemoveIngredient(bi.item.id)} className="text-text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center text-sm">
                                                <div className="text-center">
                                                    <div className="text-[10px] text-text-muted mb-0.5">총 배합량</div>
                                                    <div className="flex items-center gap-1">
                                                        <NumberInput
                                                            className="w-20 h-7 text-sm text-center bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg focus:border-primary outline-none"
                                                            value={bi.batchQty}
                                                            onChange={(val) => handleUpdateBatchQty(bi.item.id, val)}
                                                        />
                                                        <span className="text-[10px] font-normal text-text-muted">{bi.item.purchase_unit}</span>
                                                    </div>
                                                </div>

                                                <div className="text-text-muted/30">
                                                    <ArrowRight size={16} />
                                                </div>

                                                <div className="text-center bg-primary/5 rounded-lg py-1.5 border border-primary/10">
                                                    <div className="text-[10px] text-primary/70 mb-0.5">1개당 소요량</div>
                                                    <div className="font-mono font-black text-primary">
                                                        {(bi.batchQty / productionQty).toLocaleString(undefined, { maximumFractionDigits: 4 })} <span className="text-[10px] font-normal text-primary/70">{bi.item.purchase_unit}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#1e1e1e]">
                                <div className="flex gap-3">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 font-bold text-text-muted hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={handleApply}
                                        disabled={batchIngredients.length === 0}
                                        className="flex-[2] py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                    >
                                        <Calculator size={18} />
                                        <span>적용하기 ({batchIngredients.length}개 항목)</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
