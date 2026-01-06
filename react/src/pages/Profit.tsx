import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useStats } from '../hooks/useStats';
import type { ProductAnalysis } from '../hooks/useStats';
import {
    TrendingUp,
    Calendar,
    RefreshCw,
    BarChart3,
    Info,
    Target,
    DollarSign,
    PieChart as PieChartIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend
} from 'recharts';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { NumberInput } from '../components/common/NumberInput';
import { GuideButton } from '../components/common/GuideButton';
import { GuideModal } from '../components/common/GuideModal';
import Card from '../components/ui/Card';

const ProfitPage: React.FC = () => {
    const { loading, fetchMonthStats } = useStats();
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    // Simulation States
    const [simulationMode, setSimulationMode] = useState<'Forecast' | 'Goal'>('Forecast');
    const [allocationMethod, setAllocationMethod] = useState<'Quantity' | 'Revenue'>('Quantity');
    const [includeFixedCosts, setIncludeFixedCosts] = useState(true);
    const [additionalCost, setAdditionalCost] = useState(0);
    const [goalRevenue, setGoalRevenue] = useState(10000000); // Default 10M
    const [priceAdjustment, setPriceAdjustment] = useState(0); // Percentage -20 to +20
    const [showGuide, setShowGuide] = useState(false);

    const [rawData, setRawData] = useState<any>(null);

    const loadData = useCallback(async () => {
        const [year, month] = selectedMonth.split('-').map(Number);
        // Always fetch Forecast data to get Estimated Sales for Sales Mix calculation
        const data = await fetchMonthStats(year, month - 1, true);
        setRawData(data);
    }, [fetchMonthStats, selectedMonth]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const { products = [], totalOperatingExpenses = 0, totalInventoryLoss = 0, salesMap = {} } = rawData || {};

    // 1. Calculate Base Metrics & Sales Mix
    const baseAnalysis = useMemo(() => {
        if (!rawData) return { items: [], totalQty: 0, totalRev: 0 };

        const items = products.map((p: any) => {
            const estimatedQty = salesMap[p.name] || 0;
            return {
                ...p,
                base_qty: estimatedQty,
                base_revenue: p.selling_price * estimatedQty,
            };
        }).filter((p: any) => p.base_qty > 0); // Only active items

        const totalQty = items.reduce((sum: number, p: any) => sum + p.base_qty, 0);
        const totalRev = items.reduce((sum: number, p: any) => sum + p.base_revenue, 0);

        return {
            items: items.map((p: any) => ({
                ...p,
                qty_mix_ratio: totalQty > 0 ? p.base_qty / totalQty : 0,
                rev_mix_ratio: totalRev > 0 ? p.base_revenue / totalRev : 0
            })),
            totalQty,
            totalRev
        };
    }, [rawData, products, salesMap]);

    // 2. Perform Simulation
    const simulation = useMemo(() => {
        if (!rawData) return null;

        const totalOperatingCost = (includeFixedCosts ? totalOperatingExpenses : 0) + additionalCost;
        let factor = 1;

        // Apply Price Adjustment
        const priceMultiplier = 1 + (priceAdjustment / 100);

        if (simulationMode === 'Goal') {

            // Reverse Calculation Logic
            // We need to find a 'factor' such that TotalRevenue comes close to GoalRevenue.
            // Current Total Rev (with price adj) = Sum(Qty * Price * Multiplier)
            // We scale Qty by 'factor'.

            // Expected Rev = Sum( (BaseQty * factor) * (Price * Multiplier) )
            //              = factor * Multiplier * Sum(BaseQty * Price)
            //              = factor * Multiplier * BaseTotalRev

            // Therefore: factor = GoalRev / (Multiplier * BaseTotalRev)

            if (baseAnalysis.totalRev > 0) {
                factor = goalRevenue / (priceMultiplier * baseAnalysis.totalRev);
            }
        } else {
            // Forecast Mode: Just use base quantities
            factor = 1;
        }

        const simulatedItems: ProductAnalysis[] = baseAnalysis.items.map((p: any) => {
            const adjustedPrice = p.selling_price * priceMultiplier;
            const simulatedQty = p.base_qty * factor;
            const total_revenue = simulatedQty * adjustedPrice;
            const total_variable_cost = simulatedQty * p.cost_price;

            return {
                name: p.name,
                selling_price: adjustedPrice,
                unit_variable_cost: p.cost_price,
                sales_count: simulatedQty,
                total_revenue,
                total_variable_cost,
                allocated_fixed_cost: 0,
                total_profit: 0,
                margin_rate: 0
            };
        });

        const totalSalesQuantity = simulatedItems.reduce((sum, p) => sum + p.sales_count, 0);
        const totalSimulatedRevenue = simulatedItems.reduce((sum, p) => sum + p.total_revenue, 0);

        // Allocation & Profit
        const finalItems = simulatedItems.map(p => {
            let allocated = 0;
            if (totalOperatingCost > 0) {
                if (allocationMethod === 'Quantity') {
                    allocated = totalSalesQuantity > 0 ? (p.sales_count / totalSalesQuantity) * totalOperatingCost : 0;
                } else {
                    allocated = totalSimulatedRevenue > 0 ? (p.total_revenue / totalSimulatedRevenue) * totalOperatingCost : 0;
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
        }).sort((a, b) => b.total_profit - a.total_profit);

        const summaries = {
            revenue: totalSimulatedRevenue,
            variable: finalItems.reduce((sum, p) => sum + p.total_variable_cost, 0),
            fixed: finalItems.reduce((sum, p) => sum + p.allocated_fixed_cost, 0),
            profit: 0,
            margin: 0,
            inventoryLoss: totalInventoryLoss
        };
        summaries.profit = summaries.revenue - (summaries.variable + summaries.fixed + summaries.inventoryLoss);
        summaries.margin = summaries.revenue > 0 ? (summaries.profit / summaries.revenue) * 100 : 0;

        // BEP Calculation
        // BEP Sales = Fixed Costs / (Weighted Avg Contribution Margin Ratio)
        // Weighted Avg CMR = (Total Revenue - Total Variable Cost) / Total Revenue
        const contributionMargin = summaries.revenue - summaries.variable;
        const cmRatio = summaries.revenue > 0 ? contributionMargin / summaries.revenue : 0;
        const totalFixedCosts = summaries.fixed + summaries.inventoryLoss; // Treat inventory loss as fixed for conservatism

        const bepRevenue = cmRatio > 0 ? totalFixedCosts / cmRatio : 0;

        return { items: finalItems, summaries, bepRevenue };

    }, [rawData, baseAnalysis, simulationMode, goalRevenue, allocationMethod, additionalCost, priceAdjustment, totalOperatingExpenses, totalInventoryLoss, includeFixedCosts]);

    // Daily Target Calculation
    const dailyTarget = useMemo(() => {
        if (simulationMode !== 'Goal' || !simulation) return null;

        const today = new Date();
        const [year, month] = selectedMonth.split('-').map(Number);

        // If selected month is not current month, show theoretical daily average
        if (today.getFullYear() !== year || today.getMonth() + 1 !== month) {
            const daysInMonth = new Date(year, month, 0).getDate();
            return {
                message: "월 평균 일일 목표",
                amount: goalRevenue / daysInMonth,
                isCurrentMonth: false
            };
        }

        // Current Month Logic
        const daysInMonth = new Date(year, month, 0).getDate();
        const currentDay = today.getDate();
        const remainingDays = daysInMonth - currentDay + 1; // Include today

        // Ideally we fetch 'Current Actual Revenue' here to calculate gap.
        // For simulation purposes, we can show simple daily division or gap if we had actuals.
        // Let's assume linear distribution for now as "Pace Maker"
        return {
            message: `남은 ${remainingDays}일간 매일`,
            amount: goalRevenue / daysInMonth, // Simplified for this version
            isCurrentMonth: true
        };

    }, [simulation, simulationMode, goalRevenue, selectedMonth]);

    const chartData = useMemo(() => {
        if (!simulation) return [];
        const { summaries } = simulation;
        const data = [
            { name: '재료비', value: summaries.variable, color: '#3B82F6' },
            { name: '운영비', value: summaries.fixed, color: '#94A3B8' },
            { name: '순수익', value: Math.max(0, summaries.profit), color: '#10B981' },
        ];
        if (summaries.inventoryLoss > 0) data.push({ name: '재고 손실', value: summaries.inventoryLoss, color: '#F59E0B' });
        if (summaries.profit < 0) data.push({ name: '손실', value: Math.abs(summaries.profit), color: '#EF4444' });
        return data;
    }, [simulation]);

    if (!simulation) return <div className="py-20 text-center"><RefreshCw className="animate-spin mx-auto text-primary" /></div>;

    const { items, summaries, bepRevenue } = simulation;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-text-main flex items-center gap-3">
                        <TrendingUp className="text-primary" size={40} />
                        수익 시뮬레이션
                        <GuideButton onClick={() => setShowGuide(true)} className="ml-2" />
                    </h1>
                    <p className="text-text-muted font-medium mt-2">가격 변동과 목표 매출에 따른 수익 구조를 예측해볼 수 있습니다. (실제 결산과 무관)</p>
                </div>

                <div className="flex items-center gap-3">
                    <Input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="font-bold border-none bg-transparent shadow-none focus:ring-0 !py-0 w-auto"
                        leftIcon={<Calendar className="text-primary" size={20} />}
                        containerClassName="!space-y-0"
                    />
                    <Button variant="ghost" size="icon" onClick={loadData}>
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </Button>
                </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                <Info className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-amber-900 dark:text-amber-100">
                    <p className="font-bold mb-1">💡 시뮬레이션 전용 페이지입니다.</p>
                    <p className="opacity-90">
                        이곳의 결과는 현재 등록된 '제품 표준 원가(BOM)'를 기준으로 계산된 <strong>예측치</strong>입니다.<br />
                        실제 통장 잔고와 일치하는 정확한 수익 확인은 <strong>[지출 관리]</strong> 메뉴를 이용해주세요.
                    </p>
                </div>
            </div>

            {/* Simulation Controls */}
            <Card variant="glass" className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent">

                {/* 1. Goal Setting */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="flex gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 mb-6">
                        <Button
                            variant="secondary"
                            onClick={() => setSimulationMode('Forecast')}
                            className="flex-1"
                            isSelected={simulationMode === 'Forecast'}
                        >
                            기본 예측
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setSimulationMode('Goal')}
                            className="flex-1"
                            isSelected={simulationMode === 'Goal'}
                        >
                            목표 역산
                        </Button>
                    </div>

                    <AnimatePresence mode="wait">
                        {simulationMode === 'Goal' ? (
                            <motion.div
                                key="goal"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                <NumberInput
                                    label="월간 목표 매출"
                                    value={goalRevenue}
                                    onChange={setGoalRevenue}
                                    className="text-right text-2xl font-black text-primary h-14"
                                    rightIcon={<span className="text-lg font-bold">원</span>}
                                />
                                {dailyTarget && (
                                    <div className="flex items-center justify-between p-4 bg-primary/10 rounded-xl border border-primary/20">
                                        <div className="flex items-center gap-2 text-primary font-bold">
                                            <Calendar size={18} />
                                            <span>오늘의 미션</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-primary/70">{dailyTarget.message}</div>
                                            <div className="text-xl font-black text-primary">{Math.round(dailyTarget.amount).toLocaleString()}원 달성</div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="forecast"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="p-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/5 h-[160px] flex flex-col justify-center items-center text-center space-y-2"
                            >
                                <BarChart3 className="text-text-muted mb-2" size={32} />
                                <h3 className="font-bold text-lg text-text-main">품목별 예상 판매량 기반</h3>
                                <p className="text-sm text-text-muted">각 품목에 설정된 '월간 예상 판매량' 데이터를<br />바탕으로 수익을 예측합니다.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 2. Parameters */}
                <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-white/10 pt-8 lg:pt-0 lg:pl-8">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                                    <DollarSign size={14} /> 가격 조정 시뮬레이션
                                </label>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${priceAdjustment > 0 ? 'bg-emerald-500/20 text-emerald-500' : priceAdjustment < 0 ? 'bg-red-500/20 text-red-500' : 'bg-gray-200 text-gray-500'}`}>
                                    {priceAdjustment > 0 ? '+' : ''}{priceAdjustment}%
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold text-text-muted">-20%</span>
                                <input
                                    type="range"
                                    min="-20"
                                    max="20"
                                    step="5"
                                    value={priceAdjustment}
                                    onChange={(e) => setPriceAdjustment(Number(e.target.value))}
                                    className="flex-1 accent-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="text-xs font-bold text-text-muted">+20%</span>
                            </div>
                            <p className="text-xs text-text-muted">전체 판매가를 조정하여 수익성 변화를 관찰합니다.</p>
                        </div>

                        <div className="space-y-4 pt-2">
                            <label className="text-xs font-black text-text-muted uppercase tracking-widest">운영비 옵션</label>
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-lg">
                                    <button className={`flex-1 py-1.5 text-xs font-bold rounded ${allocationMethod === 'Quantity' ? 'bg-white dark:bg-gray-700 shadow text-text-main' : 'text-text-muted'}`} onClick={() => setAllocationMethod('Quantity')}>판매량 비례 배분</button>
                                    <button className={`flex-1 py-1.5 text-xs font-bold rounded ${allocationMethod === 'Revenue' ? 'bg-white dark:bg-gray-700 shadow text-text-main' : 'text-text-muted'}`} onClick={() => setAllocationMethod('Revenue')}>매출액 비례 배분</button>
                                </div>
                                <label className="flex items-center gap-2 text-sm font-bold text-text-main cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={includeFixedCosts}
                                        onChange={(e) => setIncludeFixedCosts(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span>기존 등록된 고정비({totalOperatingExpenses.toLocaleString()}원) 포함하기</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 flex flex-col justify-end">
                        <NumberInput
                            label="가상 추가 지출 (월세, 인건비 등)"
                            value={additionalCost}
                            onChange={setAdditionalCost}
                            placeholder="0"
                            className="text-right font-bold bg-white dark:bg-black/20"
                            rightIcon={<span className="text-sm font-bold">원</span>}
                        />

                        <div className="p-4 bg-amber-50 dark:bg-amber-400/5 border border-amber-200 dark:border-amber-400/20 rounded-xl space-y-1">
                            <div className="flex justify-between items-center text-amber-700 dark:text-amber-400">
                                <span className="text-xs font-bold uppercase">손익분기점 (BEP)</span>
                                <span className="font-black">{Math.round(bepRevenue).toLocaleString()}원</span>
                            </div>
                            <div className="w-full bg-amber-200 dark:bg-amber-900/30 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-amber-500"
                                    style={{ width: `${Math.min(100, (summaries.revenue / bepRevenue) * 100)}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-amber-600/70 dark:text-amber-400/60 text-right">
                                {summaries.revenue >= bepRevenue ? '손익분기점 돌파 🎉' : `${Math.round(bepRevenue - summaries.revenue).toLocaleString()}원 부족`}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Main Result Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Revenue Card */}
                    <Card variant="glass" className="space-y-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-primary/10"></div>
                        <div className="relative">
                            <p className="text-xs font-bold text-text-muted mb-1">예상 총 매출</p>
                            <h2 className="text-3xl font-black text-primary">{Math.round(summaries.revenue).toLocaleString()}원</h2>
                            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-text-muted">
                                <span>총 판매량: <span className="text-text-main font-bold">{Math.round(items.reduce((sum, p) => sum + p.sales_count, 0)).toLocaleString()}개</span></span>
                            </div>
                        </div>
                    </Card>

                    {/* Cost & Profit Card */}
                    <Card variant="glass" className="space-y-4 relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-text-muted">예상 순수익</p>
                                <h2 className={`text-4xl font-black ${summaries.profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {Math.round(summaries.profit).toLocaleString()}원
                                </h2>
                            </div>
                            <div className={`px-3 py-1 rounded-lg text-lg font-black ${summaries.profit >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                {summaries.margin.toFixed(1)}%
                            </div>
                        </div>

                        <div className="flex gap-2 text-[10px] font-bold uppercase text-text-muted pt-2 border-t border-gray-200 dark:border-white/5">
                            <div className="flex-1">
                                <span className="block mb-1">재료비</span>
                                <span className="text-blue-400">{Math.round(summaries.variable).toLocaleString()}</span>
                            </div>
                            <div className="w-px bg-gray-200 dark:bg-white/10"></div>
                            <div className="flex-1">
                                <span className="block mb-1">운영비</span>
                                <span className="text-slate-400">{Math.round(summaries.fixed).toLocaleString()}</span>
                            </div>
                            {summaries.inventoryLoss > 0 && (
                                <>
                                    <div className="w-px bg-gray-200 dark:bg-white/10"></div>
                                    <div className="flex-1">
                                        <span className="block mb-1">재고손실</span>
                                        <span className="text-amber-500">{Math.round(summaries.inventoryLoss).toLocaleString()}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </Card>

                    {/* Chart Section */}
                    <div className="col-span-full glass p-6 flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1 w-full">
                            <h3 className="font-bold flex items-center gap-2 mb-4 text-sm"><PieChartIcon className="text-primary" size={16} /> 수익 구조 분석</h3>
                            <div className="h-[200px] w-full flex justify-center">
                                <PieChart width={300} height={200}>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
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
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                                </PieChart>
                            </div>
                        </div>
                        <div className="flex-1 space-y-4 w-full">
                            <h3 className="font-bold text-sm mb-4">비용 효율성 진단</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span>마진율 (목표: 30% 이상)</span>
                                        <span className={summaries.margin >= 30 ? 'text-emerald-500' : 'text-amber-500'}>{summaries.margin.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, summaries.margin)}%` }}
                                            className={`h-full ${summaries.margin >= 30 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span>원가율 (권장: 35% 이하)</span>
                                        <span className={summaries.revenue > 0 && (summaries.variable / summaries.revenue) <= 0.35 ? 'text-emerald-500' : 'text-red-500'}>
                                            {summaries.revenue > 0 ? ((summaries.variable / summaries.revenue) * 100).toFixed(1) : 0}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, summaries.revenue > 0 ? (summaries.variable / summaries.revenue) * 100 : 0)}%` }}
                                            className={`h-full ${summaries.revenue > 0 && (summaries.variable / summaries.revenue) <= 0.35 ? 'bg-emerald-500' : 'bg-red-500'}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Item List */}
                <div className="lg:col-span-4 glass flex flex-col h-[600px]">
                    <div className="p-5 border-b border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                        <h3 className="font-bold flex items-center gap-2">
                            <Target size={18} className="text-primary" />
                            {simulationMode === 'Goal' ? '목표 달성을 위한 판매량' : '예상 판매 시나리오'}
                        </h3>
                        <p className="text-xs text-text-muted mt-1">
                            {simulationMode === 'Goal' ? '현재 판매 비율을 유지했을 때 필요한 수량입니다.' : '설정된 예상 판매량을 기준으로 합니다.'}
                        </p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                        {items.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-50">
                                <Info size={32} className="mb-2" />
                                <p className="text-xs">데이터가 없습니다.</p>
                            </div>
                        ) : (
                            items.map((item, idx) => (
                                <div key={idx} className="p-3 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 hover:border-primary/30 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-sm text-text-main line-clamp-1">{item.name}</span>
                                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${item.margin_rate >= 30 ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-white/10 text-text-muted'}`}>
                                            마진 {item.margin_rate.toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div className="text-xs text-text-muted">
                                            <span className="font-bold text-primary text-base">{Math.round(item.sales_count).toLocaleString()}</span>
                                            <span className="text-[10px] ml-1">개 판매 시</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-text-main">{Math.round(item.total_profit).toLocaleString()}원</div>
                                            <div className="text-[10px] text-text-muted">순수익</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>


            {/* Calculation Guide Modal */}
            <GuideModal
                isOpen={showGuide}
                onClose={() => setShowGuide(false)}
                pageId="profit_analysis"
                title="마진율 분석 가이드"
            />
        </div>
    );
};

export default ProfitPage;
