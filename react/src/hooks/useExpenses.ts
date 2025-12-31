import { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { Expense, FixedCost } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useExpenses = () => {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchExpenses = useCallback(async (year: number, month: number) => {
        if (!user) return;
        setLoading(true);
        try {
            const startOfMonth = new Date(year, month, 1).toISOString();
            const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

            const { data, error } = await supabase
                .from('Expenses')
                .select('*')
                .eq('user_id', user.id)
                .gte('expense_date', startOfMonth)
                .lte('expense_date', endOfMonth)
                .order('expense_date', { ascending: false });

            if (error) throw error;
            setExpenses(data || []);
        } catch (err: any) {
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const fetchFixedCosts = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('FixedCosts')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setFixedCosts(data || []);
        } catch (err: any) {
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const saveExpense = async (expense: Partial<Expense>) => {
        if (!user) return;
        try {
            if (expense.id) {
                await supabase.from('Expenses').update(expense).eq('id', expense.id);
            } else {
                await supabase.from('Expenses').insert({ ...expense, user_id: user.id });
            }
        } catch (err: any) {
            alert(`지출 저장 실패: ${err.message}`);
        }
    };

    const deleteExpense = async (id: number) => {
        try {
            await supabase.from('Expenses').delete().eq('id', id);
        } catch (err: any) {
            alert(`지출 삭제 실패: ${err.message}`);
        }
    };

    const saveFixedCost = async (fixedCost: Partial<FixedCost>) => {
        if (!user) return;
        try {
            if (fixedCost.id) {
                await supabase.from('FixedCosts').update(fixedCost).eq('id', fixedCost.id);
            } else {
                await supabase.from('FixedCosts').insert({ ...fixedCost, user_id: user.id });
            }
        } catch (err: any) {
            alert(`고정비 저장 실패: ${err.message}`);
        }
    };

    const deleteFixedCost = async (id: number) => {
        try {
            await supabase.from('FixedCosts').delete().eq('id', id);
        } catch (err: any) {
            alert(`고정비 삭제 실패: ${err.message}`);
        }
    };

    const importFixedCostsToExpenses = async (year: number, month: number) => {
        if (!user || fixedCosts.length === 0) return;
        try {
            const newExpenses = fixedCosts.map(fc => ({
                user_id: user.id,
                name: fc.name,
                amount: fc.amount,
                category: '고정비',
                expense_date: new Date(year, month, Math.min(fc.payment_day, new Date(year, month + 1, 0).getDate())).toISOString(),
                description: fc.description
            }));

            const { error } = await supabase.from('Expenses').insert(newExpenses);
            if (error) throw error;
            await fetchExpenses(year, month);
        } catch (err: any) {
            alert(`불러오기 실패: ${err.message}`);
        }
    };

    return {
        expenses, fetchExpenses, saveExpense, deleteExpense,
        fixedCosts, fetchFixedCosts, saveFixedCost, deleteFixedCost,
        importFixedCostsToExpenses,
        loading
    };
};
