import React, { useEffect, useState, useMemo } from 'react';
import { useItems } from '../hooks/useItems';
import { useOrders } from '../hooks/useOrders';
import { useExpenses } from '../hooks/useExpenses';
import type { BOM } from '../types';
import {
    ClipboardCheck,
    Calendar,
    Save,
    Search,
    Package,
    AlertTriangle
} from 'lucide-react';

const InventoryCheckPage: React.FC = () => {
    const { items, fetchItems, fetchBOMs } = useItems();
    const { orders, fetchOrders } = useOrders();
    const { saveExpense } = useExpenses();

    const [periodType, setPeriodType] = useState<'Monthly' | 'Quarterly' | 'Half-yearly'>('Monthly');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [searchQuery, setSearchQuery] = useState('');

    // User Inputs Map: { itemId: { in_qty: number, actual_stock: number } }
    const [inputs, setInputs] = useState<Record<number, { in_qty: number, actual_stock: number | '' }>>({});

    // BOM Data
    const [boms, setBoms] = useState<BOM[]>([]);

    // Fetch Data
    useEffect(() => {
        fetchItems();
        fetchBOMs().then(data => setBoms(data));
    }, [fetchItems, fetchBOMs]);

    // Fetch Orders when date/period changes
    useEffect(() => {
        // Calculate start/end date based on periodType and selectedDate
        const date = new Date(selectedDate + '-01');
        let startDate = '';
        let endDate = '';

        const y = date.getFullYear();
        const m = date.getMonth(); // 0-11

        if (periodType === 'Monthly') {
            startDate = new Date(y, m, 1).toISOString().split('T')[0];
            endDate = new Date(y, m + 1, 0).toISOString().split('T')[0];
        } else if (periodType === 'Quarterly') {
            const q = Math.floor(m / 3);
            startDate = new Date(y, q * 3, 1).toISOString().split('T')[0];
            endDate = new Date(y, (q + 1) * 3, 0).toISOString().split('T')[0];
        } else { // Half-yearly
            const h = m < 6 ? 0 : 1;
            startDate = new Date(y, h * 6, 1).toISOString().split('T')[0];
            endDate = new Date(y, (h + 1) * 6, 0).toISOString().split('T')[0];
        }

        fetchOrders({ startDate, endDate, status: 'All' });
    }, [fetchOrders, selectedDate, periodType]);

    const auditList = useMemo(() => {
        if (!items) return [];

        const materials = items.filter(i => i.type === 'Material');

        // 1. Calculate Theoretical Usage from Orders + BOM
        const usageMap = new Map<number, number>(); // MaterialID -> Used Qty

        if (orders && boms.length > 0) {
            // Helper: Map Product Name -> ID (Case-insensitive & Trimmed)
            const itemNameToId = new Map<string, number>();
            items.forEach(i => itemNameToId.set(i.name.trim().toLowerCase(), i.id));

            console.log('Calculating usage for orders:', orders.length);
            console.log('BOMs available:', boms.length);

            // Helper: Map ParentID -> BOMs
            const bomMap = new Map<number, BOM[]>();
            boms.forEach(b => {
                const list = bomMap.get(b.parent_item_id) || [];
                list.push(b);
                bomMap.set(b.parent_item_id, list);
            });

            // Iterate Orders
            orders
                .filter(o => o.status !== '취소')
                .forEach(order => {
                    order.Items?.forEach(orderItem => {
                        const nameToSearch = orderItem.item_name.trim().toLowerCase();
                        const productId = itemNameToId.get(nameToSearch);
                        if (productId) {
                            const productBoms = bomMap.get(productId);
                            if (productBoms) {
                                productBoms.forEach(bom => {
                                    const materialId = bom.child_item_id;
                                    const required = bom.quantity * orderItem.quantity;
                                    const current = usageMap.get(materialId) || 0;
                                    usageMap.set(materialId, current + required);
                                });
                            } else {
                                console.warn(`No BOM found for product: ${nameToSearch} (ID: ${productId})`);
                            }
                        } else {
                            console.warn(`No matching item found for order item: "${nameToSearch}"`);
                        }
                    });
                });
            console.log('Final usage map:', Object.fromEntries(usageMap));
        }

        return materials.map(m => {
            const input = inputs[m.id] || { in_qty: 0, actual_stock: '' };
            const prev_stock = 0; // Placeholder
            const out_qty = usageMap.get(m.id) || 0; // Calculated Usage!

            const system_stock = prev_stock + input.in_qty - out_qty;
            const actual = input.actual_stock === '' ? 0 : Number(input.actual_stock);
            // Variance = Actual - System.
            const diff_qty = actual - system_stock;

            return {
                ...m,
                prev_stock,
                in_qty: input.in_qty,
                out_qty,
                system_stock,
                actual_stock: input.actual_stock,
                diff_qty: diff_qty,
                loss_amount: diff_qty * m.cost_price // Negative if loss
            };
        });

    }, [items, inputs, orders, boms]);

    const handleInput = (id: number, field: 'in_qty' | 'actual_stock', value: string) => {
        const num = value === '' ? '' : Number(value);
        setInputs(prev => ({
            ...prev,
            [id]: {
                ...prev[id] || { in_qty: 0, actual_stock: '' },
                [field]: num === '' ? '' : Number(num)
            }
        }));
    };

    const totalLoss = auditList.reduce((sum, item) => {
        // Only count negative diffs (Loss) as expense
        if (item.diff_qty < 0) return sum + (Math.abs(item.diff_qty) * item.cost_price);
        return sum;
    }, 0);

    const handleSave = async () => {
        if (!confirm(`총 재고 손실 금액 ${totalLoss.toLocaleString()}원을 지출로 등록할까요?`)) return;

        try {
            // 1. Save Expense
            if (totalLoss > 0) {
                await saveExpense({
                    expense_date: new Date().toISOString().split('T')[0],
                    category: '재고손실',
                    name: `재고 실사 손실 보정(${selectedDate})`,
                    amount: totalLoss,
                    description: `기간: ${selectedDate} / 구분: ${periodType}\n손실 자동 계산 등록`
                });
            }
            // 2. Update Items Stock? (We don't have stock field field yet, so skip)

            alert('재고 실사가 완료되었습니다.\n손실 금액이 지출에 반영되었습니다.');
            setInputs({});
        } catch (e) {
            console.error(e);
            alert('저장 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black mb-2 flex items-center gap-3 text-white">
                        <ClipboardCheck className="text-primary" size={40} />
                        재고 실사 (Inventory Audit)
                    </h1>
                    <p className="text-text-muted font-medium">전산 재고와 실제 재고를 비교하여 손실을 파악하고 비용으로 처리합니다.</p>
                </div>
            </div>

            {/* Controls */}
            <div className="glass p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                        <Calendar size={14} /> 실사 기간 기준
                    </label>
                    <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
                        {(['Monthly', 'Quarterly', 'Half-yearly'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setPeriodType(t)}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${periodType === t ? 'bg-primary text-white shadow' : 'text-text-muted hover:text-white'}`}
                            >
                                {t === 'Monthly' ? '월간' : t === 'Quarterly' ? '분기' : '반기'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                        <Calendar size={14} /> 대상 기간 선택
                    </label>
                    <input
                        type="month"
                        className="input-field h-10"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                        <Search size={14} /> 품목 검색
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                        <input
                            className="input-field h-10 !pl-12"
                            placeholder="원재료명 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="glass overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2">
                        <Package className="text-primary" size={18} /> 실사 대상 원재료 목록
                    </h3>
                    <div className="text-sm font-medium text-text-muted">
                        총 조회된 품목: <span className="text-white">{auditList.length}</span>개
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-white/[0.02] text-xs font-black text-text-muted uppercase tracking-widest border-b border-white/5">
                                <th className="px-4 py-4 min-w-[150px]">원재료명</th>
                                <th className="px-4 py-4 text-right bg-white/5">기초 재고</th>
                                <th className="px-4 py-4 text-right bg-white/5">구매량(입고)</th>
                                <th className="px-4 py-4 text-right bg-white/5">이론 소비(출고)</th>
                                <th className="px-4 py-4 text-right font-bold text-primary bg-primary/5 border-x border-primary/10">전산 재고</th>
                                <th className="px-4 py-4 text-center min-w-[120px] bg-emerald-500/5 border-t-2 border-emerald-500">실재고 입력</th>
                                <th className="px-4 py-4 text-right">차이 (Diff)</th>
                                <th className="px-4 py-4 text-right">손실 환산액</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {auditList.filter(i => i.name.includes(searchQuery)).map(item => (
                                <tr key={item.id} className="group hover:bg-white/[0.01]">
                                    <td className="px-4 py-3 font-medium">
                                        <div className="text-white">{item.name}</div>
                                        <div className="text-[10px] text-text-muted">{item.cost_price.toLocaleString()}원 / Unit</div>
                                    </td>

                                    {/* Calculating Columns */}
                                    <td className="px-4 py-3 text-right text-text-muted">{item.prev_stock}</td>
                                    <td className="px-4 py-3 text-right">
                                        <input
                                            type="number"
                                            className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-right outline-none focus:border-primary text-white"
                                            placeholder="0"
                                            value={item.in_qty === 0 && !inputs[item.id]?.in_qty ? '' : item.in_qty}
                                            onChange={(e) => handleInput(item.id, 'in_qty', e.target.value)}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-right text-text-muted">{item.out_qty} <span className="text-[10px] text-red-400">(-)</span></td>

                                    {/* System Stock */}
                                    <td className="px-4 py-3 text-right font-bold text-primary bg-primary/[0.02] border-x border-primary/[0.05]">
                                        {item.system_stock.toLocaleString()}
                                    </td>

                                    {/* Actual Input */}
                                    <td className="px-4 py-3 text-center bg-emerald-500/[0.02]">
                                        <input
                                            type="number"
                                            className="w-24 bg-emerald-500/10 border border-emerald-500/30 rounded px-2 py-1.5 text-right font-bold text-white outline-none focus:ring-2 ring-emerald-500/50"
                                            placeholder="실사량"
                                            value={item.actual_stock}
                                            onChange={(e) => handleInput(item.id, 'actual_stock', e.target.value)}
                                        />
                                    </td>

                                    {/* Diff */}
                                    <td className={`px-4 py-3 text-right font-bold ${item.diff_qty < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {item.diff_qty > 0 ? '+' : ''}{item.diff_qty.toLocaleString()}
                                    </td>

                                    {/* Loss Amount */}
                                    <td className="px-4 py-3 text-right font-mono text-text-muted">
                                        {item.diff_qty !== 0 ? Math.round(item.diff_qty * item.cost_price).toLocaleString() : '-'}원
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer Summary */}
            <div className="fixed bottom-0 left-0 md:left-[240px] right-0 bg-[#0A0A0A] border-t border-white/10 p-6 z-50 flex flex-col md:flex-row justify-between items-center gap-4 shadow-2xl">
                <div className="flex items-center gap-8">
                    <div>
                        <div className="text-xs font-bold text-text-muted uppercase">총 손실 처리 예상 금액</div>
                        <div className="text-3xl font-black text-red-500">{totalLoss.toLocaleString()}원</div>
                    </div>
                    <div className="hidden md:block h-10 w-px bg-white/10"></div>
                    <div className="text-sm text-text-muted hidden md:block">
                        <AlertTriangle className="inline text-amber-400 mr-2" size={16} />
                        '확정 및 비용 처리'를 누르면 위 금액이 [재고손실] 지출 항목으로 자동 등록됩니다.
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    className="btn btn-primary h-14 px-8 shadow-xl shadow-primary/20 font-bold text-lg flex items-center gap-2 w-full md:w-auto justify-center"
                    disabled={totalLoss === 0}
                >
                    <Save size={20} /> 실사 확정 및 비용 처리
                </button>
            </div>
        </div>
    );
};

export default InventoryCheckPage;
