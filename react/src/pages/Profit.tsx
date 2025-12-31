import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useStats } from '../hooks/useStats';
import type { ProductAnalysis } from '../hooks/useStats';
import {
    TrendingUp,
    Target,
    BarChart3,
    Calendar,
    RefreshCw,
    Info,
    DollarSign,
    PieChart as PieChartIcon,
    Minus,
    X,
    HelpCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend
} from 'recharts';

const ProfitPage: React.FC = () => {
    const { loading, fetchMonthStats } = useStats();
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [isForecastMode, setIsForecastMode] = useState(true);
    const [allocationMethod, setAllocationMethod] = useState<'Quantity' | 'Revenue'>('Quantity');
    const [additionalCost, setAdditionalCost] = useState(0);
    const [showGuide, setShowGuide] = useState(false);

    const [rawData, setRawData] = useState<any>(null);

    const loadData = useCallback(async () => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const data = await fetchMonthStats(year, month - 1, isForecastMode);
        setRawData(data);
    }, [fetchMonthStats, selectedMonth, isForecastMode]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const { products = [], totalOperatingExpenses = 0, totalInventoryLoss = 0, salesMap = {} } = rawData || {};

    const analysis = useMemo(() => {
        if (!rawData) return [];

        const totalOperatingCost = totalOperatingExpenses + additionalCost;

        // Initial mapping
        let result: ProductAnalysis[] = products.map((p: any) => {
            const sales_count = salesMap[p.name] || 0;
            return {
                name: p.name,
                selling_price: p.selling_price,
                unit_variable_cost: p.cost_price,
                sales_count,
                total_revenue: p.selling_price * sales_count,
                total_variable_cost: p.cost_price * sales_count,
                allocated_fixed_cost: 0,
                total_profit: 0,
                margin_rate: 0
            };
        }).filter((p: any) => isForecastMode || p.sales_count > 0);

        const totalSalesQuantity = result.reduce((sum, p) => sum + p.sales_count, 0);
        const totalRevenue = result.reduce((sum, p) => sum + p.total_revenue, 0);

        // Allocation
        result = result.map(p => {
            let allocated = 0;
            if (totalOperatingCost > 0) {
                if (allocationMethod === 'Quantity') {
                    allocated = totalSalesQuantity > 0 ? (p.sales_count / totalSalesQuantity) * totalOperatingCost : 0;
                } else {
                    allocated = totalRevenue > 0 ? (p.total_revenue / totalRevenue) * totalOperatingCost : 0;
                }
            }

            const total_profit = p.total_revenue - (p.total_variable_cost + allocated);
            const margin_rate = p.total_revenue > 0 ? (total_profit / p.total_revenue) * 100 : 0;

            return {
                ...p,
                allocated_fixed_cost: allocated,
                total_profit,
                margin_rate
            };
        });

        return result.sort((a, b) => b.total_profit - a.total_profit);
    }, [rawData, allocationMethod, additionalCost, isForecastMode]);

    const totals = useMemo(() => {
        if (!rawData) return { revenue: 0, variable: 0, fixed: 0, profit: 0, margin: 0, inventoryLoss: 0 };
        const revenue = analysis.reduce((sum, p) => sum + p.total_revenue, 0);
        const variable = analysis.reduce((sum, p) => sum + p.total_variable_cost, 0);
        const fixed = analysis.reduce((sum, p) => sum + p.allocated_fixed_cost, 0);
        const profit = revenue - (variable + fixed + totalInventoryLoss);
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

        return { revenue, variable, fixed, profit, margin, inventoryLoss: totalInventoryLoss };
    }, [analysis, rawData, totalInventoryLoss]);

    const chartData = [
        { name: '재료비', value: totals.variable, color: '#3B82F6' },
        { name: '운영비', value: totals.fixed, color: '#94A3B8' },
        { name: '순수익', value: Math.max(0, totals.profit), color: '#10B981' },
    ];

    if (totals.inventoryLoss > 0) {
        chartData.push({ name: '재고 손실', value: totals.inventoryLoss, color: '#F59E0B' }); // Amber/Orange
    }

    if (totals.profit < 0) {
        chartData.push({ name: '손실', value: Math.abs(totals.profit), color: '#EF4444' });
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl font-black text-white flex items-center gap-3">
                            <TrendingUp className="text-primary" size={40} />
                            마진 분석 리포트
                        </h1>
                        <button onClick={() => setShowGuide(true)} className="text-text-muted hover:text-white transition-colors" title="계산 방법 보기">
                            <HelpCircle size={24} />
                        </button>
                    </div>
                    <p className="text-text-muted font-medium">실제 판매 및 지출 데이터를 기반으로 비즈니스 수익성을 진단합니다.</p>
                </div>

                <div className="flex items-center gap-3 glass p-2 rounded-2xl">
                    <Calendar className="text-primary ml-2" size={20} />
                    <input
                        type="month"
                        className="bg-transparent border-none text-white font-bold outline-none"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    />
                    <button onClick={loadData} className="p-2 hover:bg-white/10 rounded-xl text-text-muted hover:text-white transition-all">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Analysis Options Panel */}
            <div className="glass p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                    <label className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                        <Target size={14} /> 분석 모드
                    </label>
                    <div className="flex p-1 bg-white/5 rounded-xl">
                        <button
                            onClick={() => setIsForecastMode(true)}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isForecastMode ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
                        >
                            예상(시뮬레이션)
                        </button>
                        <button
                            onClick={() => setIsForecastMode(false)}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isForecastMode ? 'bg-emerald-500 text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
                        >
                            실제(주문기반)
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                        <BarChart3 size={14} /> 운영비 배분 기준
                    </label>
                    <div className="flex p-1 bg-white/5 rounded-xl">
                        <button
                            onClick={() => setAllocationMethod('Quantity')}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${allocationMethod === 'Quantity' ? 'bg-white/10 text-white' : 'text-text-muted hover:text-white'}`}
                        >
                            판매량 비례
                        </button>
                        <button
                            onClick={() => setAllocationMethod('Revenue')}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${allocationMethod === 'Revenue' ? 'bg-white/10 text-white' : 'text-text-muted hover:text-white'}`}
                        >
                            매출액 비례
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-2 text-red-400">
                        <Minus size={14} /> 가상 추가 지출 보정
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            className="input-field h-11 pr-12 text-right font-black"
                            placeholder="0"
                            value={additionalCost}
                            onChange={(e) => setAdditionalCost(Number(e.target.value))}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">원</span>
                    </div>
                </div>
            </div>

            {/* Summary Cards and Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-text-muted mb-1">{isForecastMode ? '예상 매출' : '실제 매출'}</p>
                                <h2 className="text-3xl font-black text-primary">{totals.revenue.toLocaleString()}원</h2>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                <DollarSign size={24} />
                            </div>
                        </div>
                        <div className="pt-4 border-t border-white/5">
                            <p className="text-xs font-medium text-text-muted">총 판매량: <span className="text-white font-bold">{analysis.reduce((sum, p) => sum + p.sales_count, 0).toLocaleString()}개</span></p>
                        </div>
                    </div>

                    <div className="glass p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-text-muted mb-1">총 지출 (재료+운영+손실)</p>
                                <h2 className="text-3xl font-black text-white">{(totals.variable + totals.fixed + totals.inventoryLoss).toLocaleString()}원</h2>
                            </div>
                            <div className="p-3 bg-white/5 rounded-2xl text-text-muted">
                                <TrendingUp size={24} className="rotate-180" />
                            </div>
                        </div>
                        <div className="flex gap-4 pt-4 border-t border-white/5 overflow-x-auto pb-1">
                            <div className="shrink-0">
                                <span className="text-[10px] text-text-muted block uppercase font-bold">재료비</span>
                                <span className="text-xs font-bold text-blue-400">{totals.variable.toLocaleString()}원</span>
                            </div>
                            <div className="w-px h-6 bg-white/10 shrink-0"></div>
                            <div className="shrink-0">
                                <span className="text-[10px] text-text-muted block uppercase font-bold">운영비</span>
                                <span className="text-xs font-bold text-slate-400">{totals.fixed.toLocaleString()}원</span>
                            </div>
                            <div className="w-px h-6 bg-white/10 shrink-0"></div>
                            <div className="shrink-0">
                                <span className="text-[10px] text-text-muted block uppercase font-bold">재고손실</span>
                                <span className="text-xs font-bold text-amber-500">{totals.inventoryLoss.toLocaleString()}원</span>
                            </div>
                        </div>
                        <div className="space-y-2 mt-4">
                            <div className="flex justify-between text-[10px] font-bold text-text-muted uppercase">
                                <span>비용 효율성</span>
                                <span>{totals.revenue > 0 ? ((totals.variable + totals.fixed + totals.inventoryLoss) / totals.revenue * 100).toFixed(1) : 0}%</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, totals.revenue > 0 ? ((totals.variable + totals.fixed + totals.inventoryLoss) / totals.revenue * 100) : 0)}%` }}
                                    className="h-full bg-amber-400"
                                />
                            </div>
                        </div>
                    </div>

                    <div className={`col-span-full glass p-8 flex flex-col md:flex-row items-center justify-between gap-8 border-l-4 ${totals.profit >= 0 ? 'border-l-emerald-500 bg-emerald-500/5' : 'border-l-red-500 bg-red-500/5'}`}>
                        <div className="space-y-1">
                            <p className={`text-xs font-black uppercase tracking-widest ${totals.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isForecastMode ? '예상 순수익' : '실제 순수익'}
                            </p>
                            <h2 className="text-5xl font-black text-white">{totals.profit.toLocaleString()}원</h2>
                        </div>
                        <div className="flex flex-col items-center md:items-end">
                            <div className={`text-6xl font-black ${totals.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{totals.margin.toFixed(1)}%</div>
                            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">최종 순이익률</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 glass p-6">
                    <h3 className="font-bold flex items-center gap-2 mb-6"><PieChartIcon className="text-primary" size={18} /> 순수익 구조</h3>
                    <div className="h-[250px] flex justify-center items-center">
                        <PieChart width={320} height={250}>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '12px', color: '#fff' }}
                                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            />
                            <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '12px', fontWeight: 'bold' }} />
                        </PieChart>
                    </div>
                </div>
            </div>

            {/* Detailed Analysis Table */}
            <div className="glass overflow-hidden">
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="font-bold flex items-center gap-2 text-white">
                        <TrendingUp size={18} className="text-primary" />
                        제품별 수익성 상세 분석
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-text-muted bg-white/5 px-4 py-2 rounded-full">
                        <Info size={12} />
                        운영비는 {allocationMethod === 'Quantity' ? '판매량' : '매출액'} 기준 {(totals.fixed).toLocaleString()}원이 배분되었습니다.
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] text-[10px] font-black text-text-muted uppercase tracking-widest">
                                <th className="px-6 py-4">제품명</th>
                                <th className="px-6 py-4 text-center">판매량</th>
                                <th className="px-6 py-4 text-right">매출액</th>
                                <th className="px-6 py-4 text-right">재료비(총)</th>
                                <th className="px-6 py-4 text-right">운영비 배분</th>
                                <th className="px-6 py-4 text-right bg-white/5">단가 원가</th>
                                <th className="px-6 py-4 text-right">개당 마진</th>
                                <th className="px-6 py-4 text-center">마진율</th>
                                <th className="px-6 py-4 text-right">순수익 기여</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {analysis.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-20 text-center text-text-muted italic">분석할 데이터가 없습니다.</td>
                                </tr>
                            ) : (
                                analysis.map((p, idx) => (
                                    <tr key={idx} className="group hover:bg-white/[0.02] transition-all">
                                        <td className="px-6 py-5 font-bold text-white">{p.name}</td>
                                        <td className="px-6 py-5 text-center font-bold text-lg">{p.sales_count.toLocaleString()}</td>
                                        <td className="px-6 py-5 text-right text-text-muted">{p.total_revenue.toLocaleString()}</td>
                                        <td className="px-6 py-5 text-right text-text-muted">{p.total_variable_cost.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right text-primary/70">{p.allocated_fixed_cost.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right bg-white/5 font-mono font-bold">
                                            {(p.unit_variable_cost + (p.sales_count > 0 ? p.allocated_fixed_cost / p.sales_count : 0)).toLocaleString()}원
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${p.total_profit / p.sales_count >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {p.sales_count > 0 ? (p.total_profit / p.sales_count).toLocaleString() : 0}원
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${p.margin_rate >= 30 ? 'bg-emerald-500/20 text-emerald-400' : p.margin_rate >= 15 ? 'bg-primary/20 text-primary' : 'bg-amber-400/20 text-amber-400'}`}>
                                                {p.margin_rate.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right font-black text-lg text-white">
                                            {p.total_profit.toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showGuide && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={() => setShowGuide(false)}>
                    <div className="bg-[#1E1E1E] border border-white/10 rounded-3xl max-w-2xl w-full p-8 space-y-8 shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-black flex items-center gap-2">
                                    <Info className="text-primary" />
                                    수익 분석 계산 가이드
                                </h3>
                                <p className="text-text-muted mt-1">소복이 순수익을 계산하는 방법을 안내해 드려요.</p>
                            </div>
                            <button onClick={() => setShowGuide(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X /></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="font-bold text-lg text-emerald-400 border-b border-emerald-500/30 pb-2">기본 공식</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="glass p-3">
                                        <div className="font-bold text-white mb-1">총 매출 (Revenue)</div>
                                        <div className="text-text-muted fa-xs">판매가 × 판매 수량</div>
                                    </div>
                                    <div className="glass p-3">
                                        <div className="font-bold text-white mb-1">변동비 (Variable Cost)</div>
                                        <div className="text-text-muted fa-xs">재료 원가(BOM) × 판매 수량</div>
                                    </div>
                                    <div className="glass p-3">
                                        <div className="font-bold text-white mb-1">운영비 (Fixed Cost)</div>
                                        <div className="text-text-muted fa-xs">고정 지출 + 추가 입력 비용 (재고 손실 제외)</div>
                                    </div>
                                    <div className="glass p-3 border-l-2 border-amber-400">
                                        <div className="font-bold text-amber-400 mb-1">재고 손실 (Inventory Loss)</div>
                                        <div className="text-text-muted fa-xs">재고 실사를 통해 파악된 손실 금액</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-bold text-lg text-primary border-b border-primary/30 pb-2">배분 및 순수익</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="glass p-3">
                                        <div className="font-bold text-white mb-1">순수익 계산</div>
                                        <div className="text-text-muted fa-xs">매출 - (변동비 + 배분된 운영비 + 재고 손실)</div>
                                    </div>
                                    <div className="glass p-3">
                                        <div className="font-bold text-white mb-1">운영비 배분 기준</div>
                                        <ul className="list-disc list-inside text-text-muted text-xs space-y-1 mt-1">
                                            <li><span className="text-white font-bold">판매량 비례</span>: 많이 팔린 제품에 운영비를 더 많이 배분</li>
                                            <li><span className="text-white font-bold">매출액 비례</span>: 비싼 제품에 운영비를 더 많이 배분</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex gap-4 items-start">
                            <Info className="shrink-0 text-primary mt-1" size={20} />
                            <div className="text-sm text-text-muted">
                                <span className="text-white font-bold block mb-1">💡 팁</span>
                                '예상(시뮬레이션)' 모드에서는 아직 팔리지 않은 재고도 모두 팔렸다고 가정하여 최대 수익을 예측해 볼 수 있습니다.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfitPage;
