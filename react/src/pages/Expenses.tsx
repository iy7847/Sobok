import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useExpenses } from '../hooks/useExpenses';
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

const ExpensesPage: React.FC = () => {
    const {
        expenses, fetchExpenses, saveExpense, deleteExpense,
        fixedCosts, fetchFixedCosts, saveFixedCost, deleteFixedCost,
        importFixedCostsToExpenses,
        loading
    } = useExpenses();

    const [activeTab, setActiveTab] = useState<'History' | 'Templates'>('History');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<Expense | FixedCost | any>(null);

    const loadData = useCallback(() => {
        const [year, month] = selectedMonth.split('-').map(Number);
        if (activeTab === 'History') {
            fetchExpenses(year, month - 1);
        } else {
            fetchFixedCosts();
        }
    }, [fetchExpenses, fetchFixedCosts, selectedMonth, activeTab]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const totalMonthlyExpenses = useMemo(() =>
        expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]
    );

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
        loadData();
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
                    <h1 className="text-4xl font-black mb-2 flex items-center gap-3 text-white">
                        <Receipt className="text-primary" size={40} />
                        지출 내역 관리
                    </h1>
                    <p className="text-text-muted font-medium">비즈니스 운영을 위해 투입된 비용을 꼼꼼하게 기록하세요.</p>
                </div>

                <div className="flex p-1 bg-white/5 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('History')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'History' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
                    >
                        지출 내역
                    </button>
                    <button
                        onClick={() => setActiveTab('Templates')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'Templates' ? 'bg-white/10 text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
                    >
                        고정비 설정
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Summary Card */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass p-8 space-y-4 border-l-4 border-l-primary bg-primary/5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">
                                    {activeTab === 'History' ? `${selectedMonth} 총 지출` : '월 예상 총 고정비'}
                                </p>
                                <h2 className="text-4xl font-black text-white">
                                    {(activeTab === 'History' ? totalMonthlyExpenses : totalFixedCosts).toLocaleString()}원
                                </h2>
                            </div>
                            <div className="p-3 bg-primary/20 rounded-2xl text-primary">
                                <Wallet size={24} />
                            </div>
                        </div>
                        <p className="text-sm text-text-muted">
                            {activeTab === 'History'
                                ? "이 금액이 마진 분석 시 '총 운영비'로 반영됩니다."
                                : "이 금액을 기준으로 매달 지출을 간편하게 생성할 수 있습니다."}
                        </p>
                    </div>

                    <div className="glass p-6 space-y-4">
                        <h4 className="font-bold flex items-center gap-2"><Clock size={16} className="text-primary" /> 조회 및 도구</h4>

                        {activeTab === 'History' && (
                            <div className="space-y-4">
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                    <input
                                        type="month"
                                        className="input-field pl-12 h-12"
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={handleImport}
                                    className="btn w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-primary font-bold shadow-xl flex items-center justify-center gap-2"
                                >
                                    <ArrowDownToLine size={18} /> 고정비 일괄 불러오기
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => handleShowForm()}
                            className="btn btn-primary w-full py-4 shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                        >
                            <Plus size={20} /> {activeTab === 'History' ? '새 지출 입력' : '새 고정비 등록'}
                        </button>
                    </div>
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
                                className="glass p-8 border-t-4 border-t-primary"
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xl font-black flex items-center gap-3">
                                        <Edit2 className="text-primary" size={24} />
                                        {editingItem?.id ? '내역 수정' : '새 내역 입력'}
                                    </h3>
                                    <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleSave} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">항목명</label>
                                            <input
                                                required
                                                className="input-field"
                                                placeholder="예: 월세, 전기세, 알바비"
                                                value={editingItem?.name}
                                                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">금액 (원)</label>
                                            <input
                                                required
                                                type="number"
                                                className="input-field font-mono font-bold"
                                                value={editingItem?.amount}
                                                onChange={(e) => setEditingItem({ ...editingItem, amount: Number(e.target.value) })}
                                            />
                                        </div>
                                        {activeTab === 'History' ? (
                                            <>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">날짜</label>
                                                    <input
                                                        required
                                                        type="date"
                                                        className="input-field"
                                                        value={editingItem?.expense_date?.split('T')[0]}
                                                        onChange={(e) => setEditingItem({ ...editingItem, expense_date: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">분류</label>
                                                    <select
                                                        className="input-field"
                                                        value={editingItem?.category}
                                                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                                                    >
                                                        <option value="일반">일반</option>
                                                        <option value="고정비">고정비</option>
                                                        <option value="인건비">인건비</option>
                                                        <option value="식자재">식자재</option>
                                                        <option value="기타">기타</option>
                                                    </select>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">결제일 (매월)</label>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        required
                                                        type="number"
                                                        min="1"
                                                        max="31"
                                                        className="input-field w-24 text-center"
                                                        value={editingItem?.payment_day}
                                                        onChange={(e) => setEditingItem({ ...editingItem, payment_day: Number(e.target.value) })}
                                                    />
                                                    <span className="font-bold">일</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">설명 / 비고</label>
                                            <textarea
                                                className="input-field min-h-[100px] py-4"
                                                placeholder="상세 내용을 입력하세요..."
                                                value={editingItem?.description}
                                                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-6 border-t border-white/5">
                                        <button type="submit" className="btn btn-primary flex-1 py-4 shadow-xl shadow-primary/20 font-bold">
                                            <Check size={20} className="mr-2 inline" /> 저장하기
                                        </button>
                                        <button type="button" onClick={() => setShowForm(false)} className="btn flex-1 py-4 bg-white/5 hover:bg-white/10 font-bold">
                                            취소
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="glass overflow-hidden"
                            >
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-white/[0.02] text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-white/5">
                                                <th className="px-6 py-5">{activeTab === 'History' ? '날짜' : '항목명'}</th>
                                                <th className="px-6 py-5">{activeTab === 'History' ? '분류' : '금액'}</th>
                                                <th className="px-6 py-5">{activeTab === 'History' ? '항목명' : '결제일'}</th>
                                                <th className="px-6 py-5 text-right">{activeTab === 'History' ? '금액' : '관리'}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {loading ? (
                                                <tr><td colSpan={4} className="py-20 text-center"><RefreshCw className="animate-spin text-primary mx-auto mb-2" size={32} /><p className="text-text-muted font-bold">동기화 중...</p></td></tr>
                                            ) : (activeTab === 'History' ? expenses : fixedCosts).length === 0 ? (
                                                <tr><td colSpan={4} className="py-20 text-center text-text-muted italic">데이터가 없습니다.</td></tr>
                                            ) : (
                                                (activeTab === 'History' ? expenses : fixedCosts).map((item) => {
                                                    const historyItem = item as Expense;
                                                    const templateItem = item as FixedCost;
                                                    return (
                                                        <tr key={item.id} className="group hover:bg-white/[0.01] transition-all">
                                                            <td className="px-6 py-5">
                                                                {activeTab === 'History' ? (
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex flex-col items-center justify-center text-[10px] font-black text-white/50 border border-white/5">
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
                                                                    <span className="px-2 py-1 rounded-lg bg-white/5 text-xs text-text-muted border border-white/10 uppercase font-bold tracking-wider">{historyItem.category}</span>
                                                                ) : (
                                                                    <div className="font-mono font-bold text-primary">{templateItem.amount.toLocaleString()}원</div>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-5">
                                                                {activeTab === 'History' ? (
                                                                    <div>
                                                                        <div className="font-bold text-white">{historyItem.name}</div>
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
                                                                        <button onClick={() => handleDelete(historyItem.id)} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-400/10 text-red-400 rounded-lg transition-all"><Trash2 size={14} /></button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex justify-end gap-2">
                                                                        <button onClick={() => handleShowForm(templateItem)} className="p-2 hover:bg-white/10 text-primary rounded-lg transition-all"><Edit2 size={16} /></button>
                                                                        <button onClick={() => handleDelete(templateItem.id)} className="p-2 hover:bg-white/10 text-red-400 rounded-lg transition-all"><Trash2 size={16} /></button>
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
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ExpensesPage;
