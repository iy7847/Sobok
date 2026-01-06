import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { useMonthlySettlement } from '../hooks/useMonthlySettlement';
import {
    Receipt,
    Calendar,
    Plus,
    Trash2,
    ArrowDownToLine,
    RefreshCw,
    Wallet,
    Clock,
    Edit2,
    X,
    Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Expense, FixedCost } from '../types';
import Button from '../components/ui/Button';
import { NumberInput } from '../components/common/NumberInput';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import { GuideButton } from '../components/common/GuideButton';
import { GuideModal } from '../components/common/GuideModal';

const ExpensesPage: React.FC = () => {
    const {
        expenses, fetchExpenses, saveExpense, deleteExpense,
        fixedCosts, fetchFixedCosts, saveFixedCost, deleteFixedCost,
        importFixedCostsToExpenses,
        loading: expensesLoading
    } = useExpenses();
    const { settlement, loading: settlementLoading, fetchMonthlySettlement } = useMonthlySettlement();
    const loading = expensesLoading || settlementLoading;

    const [activeTab, setActiveTab] = useState<'History' | 'Templates'>('History');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<Expense | FixedCost | any>(null);
    const [showGuide, setShowGuide] = useState(false);

    const loadData = useCallback(() => {
        const [year, month] = selectedMonth.split('-').map(Number);
        if (activeTab === 'History') {
            fetchExpenses(year, month - 1);
            fetchMonthlySettlement(year, month - 1);
        } else {
            fetchFixedCosts();
        }
    }, [fetchExpenses, fetchFixedCosts, selectedMonth, activeTab]);

    useEffect(() => {
        loadData();
    }, [loadData]);


    const totalFixedCosts = useMemo(() =>
        fixedCosts.reduce((sum, fc) => sum + fc.amount, 0), [fixedCosts]
    );

    const handleShowForm = (item?: any) => {
        if (item) {
            setEditingItem(item);
        } else {
            const [year, month] = selectedMonth.split('-').map(Number);
            const today = new Date();
            const defaultDate = (today.getFullYear() === year && today.getMonth() + 1 === month)
                ? today.toISOString().split('T')[0]
                : new Date(year, month - 1, 1).toISOString().split('T')[0];

            setEditingItem(activeTab === 'History'
                ? { name: '', amount: 0, category: '일반', expense_date: defaultDate, description: '' }
                : { name: '', amount: 0, payment_day: 1, description: '' }
            );
        }
        setShowForm(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (activeTab === 'History') {
            await saveExpense(editingItem);
        } else {
            await saveFixedCost(editingItem);
        }
        setShowForm(false);
        // Delay reload slightly to ensure DB update propagates
        setTimeout(loadData, 500);
    };

    const handleDelete = async (id: number) => {
        if (confirm('정말 삭제하시겠습니까?')) {
            if (activeTab === 'History') {
                await deleteExpense(id);
            } else {
                await deleteFixedCost(id);
            }
            loadData();
        }
    };

    const handleImport = async () => {
        if (confirm('고정비 설정 항목들을 이달의 지출 내역에 추가하시겠습니까?')) {
            const [year, month] = selectedMonth.split('-').map(Number);
            await importFixedCostsToExpenses(year, month - 1);
            loadData();
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black mb-2 flex items-center gap-3 text-text-main">
                        <Receipt className="text-primary" size={40} />
                        지출 관리
                        <GuideButton onClick={() => setShowGuide(true)} className="ml-2" />
                    </h1>
                    <p className="text-text-muted font-medium">비즈니스 운영을 위해 투입된 비용을 꼼꼼하게 기록하세요.</p>
                </div>

                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/5">
                    <Button
                        variant="secondary"
                        onClick={() => setActiveTab('History')}
                        isSelected={activeTab === 'History'}
                    >
                        지출 내역
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => setActiveTab('Templates')}
                        isSelected={activeTab === 'Templates'}
                    >
                        고정비 설정
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Summary Card */}
                <div className="lg:col-span-4 space-y-6">
                    <Card variant="glass" className="space-y-4 border-l-4 border-l-primary bg-primary/5">
                        {activeTab === 'History' ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-2">
                                        {selectedMonth} 월간 손익 결산
                                    </p>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-text-muted">총 매출 (주문 기준)</span>
                                        <span className="font-bold text-lg text-primary">{settlement.revenue.toLocaleString()}원</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm text-text-muted">총 지출 (입력 기준)</span>
                                        <span className="font-bold text-lg text-red-400">-{settlement.expense.toLocaleString()}원</span>
                                    </div>
                                    <div className="h-px bg-gray-200 dark:bg-white/10 my-2"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-black text-text-main">순수익</span>
                                        <span className={`text-3xl font-black ${settlement.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {settlement.netProfit.toLocaleString()}원
                                        </span>
                                    </div>
                                    {settlement.revenue > 0 && (
                                        <div className="text-right mt-1">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${settlement.netProfit >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                이익률 {settlement.profitMargin.toFixed(1)}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">
                                        월 예상 총 고정비
                                    </p>
                                    <h2 className="text-4xl font-black text-text-main">
                                        {totalFixedCosts.toLocaleString()}원
                                    </h2>
                                </div>
                                <div className="p-3 bg-primary/20 rounded-2xl text-primary">
                                    <Wallet size={24} />
                                </div>
                            </div>
                        )}
                        <p className="text-xs text-text-muted leading-relaxed">
                            {activeTab === 'History'
                                ? "주문 관리에서 완료된 '총 매출'과 이곳에 입력된 '총 지출'을 합산한 실제 수익입니다."
                                : "이 금액을 기준으로 매달 지출을 간편하게 생성할 수 있습니다."}
                        </p>
                    </Card>

                    <Card variant="glass" className="space-y-4">
                        <h4 className="font-bold flex items-center gap-2"><Clock size={16} className="text-primary" /> 조회 및 도구</h4>

                        {activeTab === 'History' && (
                            <div className="space-y-4">
                                <Input
                                    type="month"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    leftIcon={<Calendar className="text-primary" size={18} />}
                                    className="pl-10"
                                />
                                <Button
                                    variant="secondary"
                                    onClick={handleImport}
                                    className="w-full flex items-center justify-center gap-2"
                                    leftIcon={<ArrowDownToLine size={18} />}
                                >
                                    고정비 일괄 불러오기
                                </Button>
                            </div>
                        )}

                        <Button
                            variant="primary"
                            onClick={() => handleShowForm()}
                            className="w-full flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
                            leftIcon={<Plus size={20} />}
                        >
                            {activeTab === 'History' ? '새 지출 입력' : '새 고정비 등록'}
                        </Button>
                    </Card>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-8 space-y-6">
                    <AnimatePresence mode="wait">
                        {showForm ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="glass p-6 md:p-8 border-t-4 border-t-primary"
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xl font-black flex items-center gap-3">
                                        <Edit2 className="text-primary" size={24} />
                                        {editingItem?.id ? '내역 수정' : '새 내역 입력'}
                                    </h3>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowForm(false)}
                                        className="rounded-full"
                                    >
                                        <X size={20} />
                                    </Button>
                                </div>

                                <form onSubmit={handleSave} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="항목명"
                                            required
                                            placeholder="예: 월세, 전기세, 알바비"
                                            value={editingItem?.name}
                                            onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                        />
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider pl-1">
                                                금액 (원)
                                            </label>
                                            <NumberInput
                                                className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-text-main placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/10 font-bold text-right"
                                                required
                                                value={editingItem?.amount || 0}
                                                onChange={(val) => setEditingItem({ ...editingItem, amount: val })}
                                            />
                                        </div>
                                        {activeTab === 'History' ? (
                                            <>
                                                <Input
                                                    label="날짜"
                                                    required
                                                    type="date"
                                                    value={editingItem?.expense_date?.split('T')[0]}
                                                    onChange={(e) => setEditingItem({ ...editingItem, expense_date: e.target.value })}
                                                />
                                                <Select
                                                    label="분류"
                                                    value={editingItem?.category}
                                                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                                                    options={[
                                                        { value: '일반', label: '일반' },
                                                        { value: '고정비', label: '고정비' },
                                                        { value: '인건비', label: '인건비' },
                                                        { value: '식자재', label: '식자재' },
                                                        { value: '기타', label: '기타' }
                                                    ]}
                                                />
                                            </>
                                        ) : (
                                            <Input
                                                label="결제일 (매월)"
                                                required
                                                type="number"
                                                min={1}
                                                max={31}
                                                rightIcon={<span className="font-bold text-sm">일</span>}
                                                value={editingItem?.payment_day}
                                                onChange={(e) => setEditingItem({ ...editingItem, payment_day: Number(e.target.value) })}
                                            />
                                        )}
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider pl-1">설명 / 비고</label>
                                            <textarea
                                                className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-text-main placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/10 min-h-[100px]"
                                                placeholder="상세 내용을 입력하세요..."
                                                value={editingItem?.description}
                                                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-white/5">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            className="flex-1 py-4 shadow-xl shadow-primary/20"
                                            leftIcon={<Check size={20} />}
                                        >
                                            저장하기
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => setShowForm(false)}
                                            className="flex-1 py-4"
                                        >
                                            취소
                                        </Button>
                                    </div>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <Card
                                    variant="glass"
                                    className="!p-0 overflow-hidden"
                                >
                                    {/* Mobile Card View */}
                                    <div className="md:hidden divide-y divide-white/5">
                                        {(activeTab === 'History' ? expenses : fixedCosts).length === 0 ? (
                                            <div className="py-20 text-center text-text-muted italic">데이터가 없습니다.</div>
                                        ) : (
                                            (activeTab === 'History' ? expenses : fixedCosts).map((item) => {
                                                const historyItem = item as Expense;
                                                const templateItem = item as FixedCost;
                                                return (
                                                    <div key={item.id} className="p-5 space-y-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <div className="font-bold text-lg text-text-main">{historyItem.name || templateItem.name}</div>
                                                                {activeTab === 'History' ? (
                                                                    <div className="text-xs text-text-muted mt-1">{new Date(historyItem.expense_date).toLocaleDateString()}</div>
                                                                ) : (
                                                                    <div className="text-xs text-text-muted mt-1 flex items-center gap-1"><Clock size={10} /> 매월 {templateItem.payment_day}일</div>
                                                                )}
                                                            </div>
                                                            <div className="text-right">
                                                                <div className={`font-mono font-bold text-lg ${activeTab === 'History' ? 'text-red-400' : 'text-primary'}`}>
                                                                    {item.amount.toLocaleString()}원
                                                                </div>
                                                                {activeTab === 'History' && (
                                                                    <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 text-[10px] text-text-muted border border-gray-200 dark:border-white/10 uppercase font-bold tracking-wider mt-1 inline-block">
                                                                        {historyItem.category}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-white/5">
                                                            <div className="text-xs text-text-muted truncate flex-1 pr-4">
                                                                {item.description || "설명 없음"}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="secondary"
                                                                    size="icon"
                                                                    onClick={() => handleShowForm(item)}
                                                                >
                                                                    <Edit2 size={16} />
                                                                </Button>
                                                                <Button
                                                                    variant="danger"
                                                                    size="icon"
                                                                    onClick={() => handleDelete(item.id)}
                                                                >
                                                                    <Trash2 size={16} />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    {/* Desktop Table View */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-gray-50 dark:bg-white/[0.02] text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-gray-200 dark:border-white/5">
                                                    <th className="px-6 py-5">{activeTab === 'History' ? '날짜' : '항목명'}</th>
                                                    <th className="px-6 py-5">{activeTab === 'History' ? '분류' : '금액'}</th>
                                                    <th className="px-6 py-5">{activeTab === 'History' ? '항목명' : '결제일'}</th>
                                                    <th className="px-6 py-5 text-right">{activeTab === 'History' ? '금액' : '관리'}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                                {loading ? (
                                                    <tr><td colSpan={4} className="py-20 text-center"><RefreshCw className="animate-spin text-primary mx-auto mb-2" size={32} /><p className="text-text-muted font-bold">동기화 중...</p></td></tr>
                                                ) : (activeTab === 'History' ? expenses : fixedCosts).length === 0 ? (
                                                    <tr><td colSpan={4} className="py-20 text-center text-text-muted italic">데이터가 없습니다.</td></tr>
                                                ) : (
                                                    (activeTab === 'History' ? expenses : fixedCosts).map((item) => {
                                                        const historyItem = item as Expense;
                                                        const templateItem = item as FixedCost;
                                                        return (
                                                            <tr key={item.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-all">
                                                                <td className="px-6 py-5">
                                                                    {activeTab === 'History' ? (
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex flex-col items-center justify-center text-[10px] font-black text-text-muted/50 dark:text-white/50 border border-gray-200 dark:border-white/5">
                                                                                <span>{new Date(historyItem.expense_date).getMonth() + 1}</span>
                                                                                <span className="text-primary leading-none text-base">{new Date(historyItem.expense_date).getDate()}</span>
                                                                            </div>
                                                                            <div className="text-xs font-medium text-text-muted">
                                                                                {new Date(historyItem.expense_date).toLocaleDateString('ko-KR', { weekday: 'short' })}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="font-bold text-lg">{templateItem.name}</div>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-5">
                                                                    {activeTab === 'History' ? (
                                                                        <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-xs text-text-muted border border-gray-200 dark:border-white/10 uppercase font-bold tracking-wider">{historyItem.category}</span>
                                                                    ) : (
                                                                        <div className="font-mono font-bold text-primary">{templateItem.amount.toLocaleString()}원</div>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-5">
                                                                    {activeTab === 'History' ? (
                                                                        <div>
                                                                            <div className="font-bold text-text-main">{historyItem.name}</div>
                                                                            <div className="text-xs text-text-muted truncate max-w-[150px]">{historyItem.description}</div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center gap-2 text-text-muted">
                                                                            <Clock size={14} /> 매월 {templateItem.payment_day}일
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-5 text-right">
                                                                    {activeTab === 'History' ? (
                                                                        <div className="flex flex-col items-end">
                                                                            <div className="text-lg font-black text-red-400">{historyItem.amount.toLocaleString()}원</div>
                                                                            <div className="flex gap-2">
                                                                                <button onClick={() => handleShowForm(historyItem)} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-100 dark:hover:bg-white/10 text-primary rounded-lg transition-all"><Edit2 size={16} /></button>
                                                                                <button onClick={() => handleDelete(historyItem.id)} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-400/10 text-red-400 rounded-lg transition-all"><Trash2 size={16} /></button>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex justify-end gap-2">
                                                                            <button onClick={() => handleShowForm(templateItem)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 text-primary rounded-lg transition-all"><Edit2 size={16} /></button>
                                                                            <button onClick={() => handleDelete(templateItem.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 text-red-400 rounded-lg transition-all"><Trash2 size={16} /></button>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <GuideModal
                isOpen={showGuide}
                onClose={() => setShowGuide(false)}
                pageId="expenses"
                title="지출 관리 가이드"
            />
        </div >
    );
};

export default ExpensesPage;
