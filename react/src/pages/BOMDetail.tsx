import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import type { Item, BOM, ItemType } from '../types';
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Search,
    Loader2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { NumberInput } from '../components/common/NumberInput';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { GuideButton } from '../components/common/GuideButton';
import { GuideModal } from '../components/common/GuideModal';

interface BomItemView extends Partial<BOM> {
    child_item?: Item;
    isNew?: boolean;
    isDeleted?: boolean;
}

const BOMDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [currentItem, setCurrentItem] = useState<Item | null>(null);
    const [bomList, setBomList] = useState<BomItemView[]>([]);
    const [allUserItems, setAllUserItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCommitting, setIsCommitting] = useState(false);
    const [showGuide, setShowGuide] = useState(false);

    const [filterType, setFilterType] = useState<ItemType>('Material');
    const [searchQuery, setSearchQuery] = useState('');
    const [inputQty, setInputQty] = useState(1);
    const [selectedItemToAdd, setSelectedItemToAdd] = useState<Item | null>(null);

    const loadData = useCallback(async () => {
        if (!id || !user) return;
        setLoading(true);
        try {
            // Load current item
            const { data: itemData, error: itemError } = await supabase
                .from('Items')
                .select('*')
                .eq('id', id)
                .single();

            if (itemError) throw itemError;
            setCurrentItem(itemData);

            // Load all items for selection
            const { data: allItems, error: allItemsError } = await supabase
                .from('Items')
                .select('*')
                .eq('user_id', user.id);

            if (allItemsError) throw allItemsError;
            setAllUserItems(allItems || []);
            const itemMap = new Map(allItems?.map(i => [i.id, i]));

            // Load BOMs
            const { data: bomData, error: bomError } = await supabase
                .from('BOMs')
                .select('*')
                .eq('parent_item_id', id);

            if (bomError) throw bomError;

            const views: BomItemView[] = (bomData || []).map(b => ({
                ...b,
                child_item: itemMap.get(b.child_item_id)
            }));
            setBomList(views);
        } catch (err: any) {
            console.error(err);
            alert('데이터 로드 실패: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, [id, user]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredSearchResults = allUserItems.filter(item =>
        (item.type === filterType) &&
        (item.id !== Number(id)) && // Can't add itself
        (item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleAddIngredient = () => {
        if (!selectedItemToAdd || !id) return;

        if (bomList.some(b => !b.isDeleted && b.child_item_id === selectedItemToAdd.id)) {
            alert('이미 목록에 있는 재료입니다.');
            return;
        }

        setBomList([...bomList, {
            parent_item_id: Number(id),
            child_item_id: selectedItemToAdd.id,
            quantity: inputQty,
            child_item: selectedItemToAdd,
            isNew: true
        }]);

        setSelectedItemToAdd(null);
        setInputQty(1);
        setSearchQuery('');
    };

    const handleRemoveIngredient = (childItemId: number) => {
        setBomList(prev => {
            const newList = [...prev];
            const index = newList.findIndex(b => b.child_item_id === childItemId);
            if (index === -1) return prev;

            if (newList[index].isNew) {
                newList.splice(index, 1);
            } else {
                newList[index] = { ...newList[index], isDeleted: true };
            }
            return newList;
        });
    };

    const calculateTotalCost = () => {
        return bomList
            .filter(b => !b.isDeleted)
            .reduce((sum, b) => sum + (b.child_item?.cost_price || 0) * (b.quantity || 0), 0);
    };

    const calculateUnitTotals = () => {
        const totals = new Map<string, number>();

        bomList
            .filter(b => !b.isDeleted && b.child_item?.purchase_unit)
            .forEach(b => {
                const unit = b.child_item!.purchase_unit!;
                const current = totals.get(unit) || 0;
                totals.set(unit, current + (b.quantity || 0));
            });

        if (totals.size === 0) return '';

        return Array.from(totals.entries())
            .map(([unit, total]) => `${total.toLocaleString()}${unit}`)
            .join(', ');
    };

    const handleCommit = async () => {
        if (!id || isCommitting) return;
        setIsCommitting(true);
        try {
            for (const bom of bomList) {
                if (bom.isNew) {
                    const { error } = await supabase.from('BOMs').insert({
                        parent_item_id: bom.parent_item_id,
                        child_item_id: bom.child_item_id,
                        quantity: bom.quantity
                    });
                    if (error) throw error;
                } else if (bom.isDeleted) {
                    const { error } = await supabase.from('BOMs').delete().eq('id', bom.id);
                    if (error) throw error;
                } else {
                    const { error } = await supabase.from('BOMs').update({
                        quantity: bom.quantity
                    }).eq('id', bom.id);
                    if (error) throw error;
                }
            }

            // Update parent item cost
            const totalCost = calculateTotalCost();
            const { error: updateError } = await supabase
                .from('Items')
                .update({ cost_price: totalCost })
                .eq('id', id);

            if (updateError) throw updateError;

            alert('저장되었습니다.');
            await loadData();
        } catch (err: any) {
            alert('저장 실패: ' + err.message);
        } finally {
            setIsCommitting(false);
        }
    };

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary mb-4" size={48} />
            <p className="text-text-muted">레시피를 불러오는 중...</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/items')} className="p-3 glass hover:bg-gray-100 dark:hover:bg-white/10 text-text-main dark:text-white rounded-2xl transition-all">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">재료 관리</span>
                        <h1 className="text-3xl font-black">
                            {currentItem?.name}
                            <GuideButton onClick={() => setShowGuide(true)} className="ml-2 inline-block align-middle" />
                        </h1>
                    </div>
                    <p className="text-text-muted text-sm house-description">구성 재료와 소요량을 관리하여 정확한 제조 원가를 산출합니다.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Ingredient Selector */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass p-6 space-y-6">
                        <h3 className="font-bold flex items-center gap-2">
                            <Plus size={18} className="text-primary" />
                            재료 추가
                        </h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    isSelected={filterType === 'Material'}
                                    onClick={() => setFilterType('Material')}
                                    className="w-full"
                                >
                                    재료
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    isSelected={filterType === 'Component'}
                                    onClick={() => setFilterType('Component')}
                                    className="w-full"
                                >
                                    반제품
                                </Button>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                                <input
                                    type="text"
                                    className="input-field pl-14 text-sm"
                                    style={{ paddingLeft: '3.5rem' }}
                                    placeholder="재료 이름 검색..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="max-h-[300px] overflow-y-auto space-y-1 pr-2 scrollbar-thin">
                                {filteredSearchResults.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setSelectedItemToAdd(item)}
                                        className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${selectedItemToAdd?.id === item.id ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-text-muted hover:text-text-main dark:hover:text-white'}`}
                                    >
                                        <span className="font-bold text-sm">{item.name}</span>
                                        <span className={`text-[10px] font-mono ${selectedItemToAdd?.id === item.id ? 'text-white/70' : 'text-text-muted'}`}>
                                            {item.cost_price.toLocaleString()}원
                                        </span>
                                    </button>
                                ))}
                                {filteredSearchResults.length === 0 && (
                                    <div className="py-10 text-center text-xs text-text-muted">검색 결과가 없습니다.</div>
                                )}
                            </div>

                            {selectedItemToAdd && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-primary/10 border border-primary/20 rounded-2xl space-y-4"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-primary">선택됨: {selectedItemToAdd.name}</span>
                                        <button onClick={() => setSelectedItemToAdd(null)} className="text-primary/50 hover:text-primary"><Trash2 size={14} /></button>
                                    </div>
                                    <div className="flex gap-2">
                                        <NumberInput
                                            className="flex-1 min-w-0 h-10 text-sm bg-white dark:bg-white/5 border border-primary/20 rounded-xl px-3 text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-right"
                                            placeholder="소요량"
                                            value={inputQty}
                                            onChange={setInputQty}
                                        />
                                        <button onClick={handleAddIngredient} className="btn btn-primary h-10 px-4 text-sm font-bold shrink-0 whitespace-nowrap">추가</button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <div className="glass p-6 border-l-4 border-l-amber-400">
                        <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                            <AlertCircle size={16} className="text-amber-400" />
                            데이터 변경 안내
                        </h4>
                        <p className="text-xs text-text-muted leading-relaxed">
                            재료를 추가하거나 소요량을 변경하면 상단 품목의 개당 원가가 즉시 재계산됩니다. 꼭 '변경사항 저장'을 눌러주세요.
                        </p>
                    </div>
                </div>

                {/* Right: BOM List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <h3 className="font-bold">구성 재료 현황</h3>
                            <button
                                onClick={handleCommit}
                                disabled={isCommitting}
                                className="btn btn-primary px-6 py-2 rounded-xl text-sm shadow-lg shadow-primary/20"
                            >
                                {isCommitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                <span>{isCommitting ? '저장 중...' : '변경사항 저장'}</span>
                            </button>
                        </div>

                        {/* Desktop View: Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-white/5">
                                        <th className="px-6 py-4">구분</th>
                                        <th className="px-6 py-4">재료 상세</th>
                                        <th className="px-6 py-4" style={{ width: '120px' }}>소요량</th>
                                        <th className="px-6 py-4 text-right">계산 원가</th>
                                        <th className="px-6 py-4 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {bomList.filter(b => !b.isDeleted).map((bom) => (
                                        <motion.tr layout key={bom.child_item_id} className="group hover:bg-white/[0.01]">
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${bom.child_item?.type === 'Component' ? 'text-amber-400 border-amber-400/20 bg-amber-400/5' : 'text-blue-400 border-blue-400/20 bg-blue-400/5'}`}>
                                                    {bom.child_item?.type === 'Component' ? '반제품' : '원자재'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-sm">
                                                <div className="flex items-center gap-2">
                                                    {bom.child_item?.name}
                                                    {(!bom.child_item?.cost_price || bom.child_item.cost_price === 0) && (
                                                        <div className="text-amber-500 tooltip" title="원가가 0원입니다. 해당 품목의 BOM을 확인하세요.">
                                                            <AlertCircle size={14} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={`text-[10px] font-normal mt-0.5 ${(!bom.child_item?.cost_price || bom.child_item.cost_price === 0) ? 'text-amber-500/80' : 'text-text-muted'}`}>
                                                    단가: {bom.child_item?.cost_price?.toLocaleString() || 0}원 / {bom.child_item?.purchase_unit}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <NumberInput
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-right font-mono text-sm focus:border-primary outline-none transition-all"
                                                        value={bom.quantity || 0}
                                                        onChange={(val) => {
                                                            setBomList(prev => prev.map(item =>
                                                                item.child_item_id === bom.child_item_id
                                                                    ? { ...item, quantity: val }
                                                                    : item
                                                            ));
                                                        }}
                                                    />
                                                    <span className="text-xs text-text-muted">{bom.child_item?.purchase_unit}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-bold text-sm text-primary">
                                                {((bom.child_item?.cost_price || 0) * (bom.quantity || 0)).toLocaleString()}원
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleRemoveIngredient(bom.child_item_id!)} className="p-2 text-text-muted hover:text-red-400 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                    {bomList.filter(b => !b.isDeleted).length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center text-text-muted italic">구성된 재료가 없습니다. 왼쪽에서 재료를 추가해 주세요.</td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-primary/5">
                                    <tr className="font-bold text-gray-900 dark:text-white border-t border-black/5 dark:border-white/5">
                                        <td colSpan={2} className="px-6 py-6 text-right text-sm">
                                            <div className="flex flex-col items-end gap-1">
                                                <span>총 소요량 합계</span>
                                                <span className="text-xs font-normal text-gray-500 dark:text-gray-400 opacity-80">{calculateUnitTotals()}</span>
                                            </div>
                                        </td>
                                        <td colSpan={2} className="px-6 py-6 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-sm">총 제조 원가 합계</span>
                                                <span className="text-2xl text-primary font-black">
                                                    {calculateTotalCost().toLocaleString()}원
                                                </span>
                                            </div>
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Mobile View: Card List */}
                        <div className="md:hidden">
                            <div className="divide-y divide-white/5">
                                {bomList.filter(b => !b.isDeleted).map((bom) => (
                                    <div key={bom.child_item_id} className="p-4 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${bom.child_item?.type === 'Component' ? 'text-amber-400 border-amber-400/20 bg-amber-400/5' : 'text-blue-400 border-blue-400/20 bg-blue-400/5'}`}>
                                                    {bom.child_item?.type === 'Component' ? '반제품' : '원자재'}
                                                </span>
                                                <div className="font-bold text-sm pt-1">
                                                    {bom.child_item?.name}
                                                </div>
                                            </div>
                                            <button onClick={() => handleRemoveIngredient(bom.child_item_id!)} className="p-2 -mr-2 text-text-muted hover:text-red-400 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 bg-white/5 rounded-xl p-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-text-muted">단가</label>
                                                <div className="text-sm font-mono text-text-muted">
                                                    {bom.child_item?.cost_price?.toLocaleString() || 0}원
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-text-muted">계산 원가</label>
                                                <div className="text-sm font-mono font-bold text-primary">
                                                    {((bom.child_item?.cost_price || 0) * (bom.quantity || 0)).toLocaleString()}원
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <label className="text-xs font-bold text-text-muted shrink-0">소요량 입력</label>
                                            <NumberInput
                                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-right font-mono text-sm focus:border-primary outline-none transition-all"
                                                value={bom.quantity || 0}
                                                onChange={(val) => {
                                                    setBomList(prev => prev.map(item =>
                                                        item.child_item_id === bom.child_item_id
                                                            ? { ...item, quantity: val }
                                                            : item
                                                    ));
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {bomList.filter(b => !b.isDeleted).length === 0 && (
                                    <div className="py-12 text-center text-text-muted italic text-sm">
                                        구성된 재료가 없습니다.<br />위쪽에서 재료를 추가해 주세요.
                                    </div>
                                )}
                            </div>
                            <div className="bg-primary/5 p-4 border-t border-black/5 dark:border-white/5">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">총 소요량</span>
                                        <span className="text-xs text-gray-600 dark:text-gray-400 text-right max-w-[200px]">
                                            {calculateUnitTotals()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">총 합계</span>
                                        <span className="text-xl font-black text-primary">
                                            {calculateTotalCost().toLocaleString()}원
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 text-[10px] text-text-muted">
                        <div className="flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-400" /> 데이터 자동 검증됨</div>
                        <div className="flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-400" /> 실시간 원가 동기화</div>
                    </div>
                </div>

                <GuideModal
                    isOpen={showGuide}
                    onClose={() => setShowGuide(false)}
                    pageId="bom_detail"
                    title="재료 관리 가이드"
                />
            </div >
        </div>
    );
};

export default BOMDetailPage;
