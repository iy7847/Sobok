import { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useMonthlySettlement = () => {
    const { user } = useAuth();
    const [settlement, setSettlement] = useState({
        revenue: 0,
        expense: 0,
        netProfit: 0,
        profitMargin: 0
    });
    const [loading, setLoading] = useState(false);

    const fetchMonthlySettlement = useCallback(async (year: number, month: number) => {
        if (!user) return;
        setLoading(true);
        try {
            const startOfMonth = new Date(year, month, 1).toISOString();
            const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

            // 1. Calculate Total Revenue (Completed Orders)
            // Note: We might want to include 'Pending' or 'Processing' depending on business logic,
            // but for 'Settlement', usually 'Completed' or all non-cancelled orders are used.
            // Let's go with all non-cancelled orders for now to match general expectation.
            const { data: orders, error: orderError } = await supabase
                .from('Orders')
                .select('total_amount')
                .eq('shop_id', user.id)
                .gte('created_at', startOfMonth)
                .lte('created_at', endOfMonth)
                .neq('status', '취소'); // Excluding Cancelled

            if (orderError) throw orderError;

            const revenue = (orders || []).reduce((sum, o) => sum + (o.total_amount || 0), 0);

            // 2. Calculate Total Expenses
            const { data: expenses, error: expenseError } = await supabase
                .from('Expenses')
                .select('amount')
                .eq('user_id', user.id)
                .gte('expense_date', startOfMonth)
                .lte('expense_date', endOfMonth);

            if (expenseError) throw expenseError;

            const expense = (expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);

            // 3. Derived Metrics
            const netProfit = revenue - expense;
            const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

            setSettlement({
                revenue,
                expense,
                netProfit,
                profitMargin
            });

        } catch (err: any) {
            console.error('Settlement Fetch Error:', err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    return { settlement, loading, fetchMonthlySettlement };
};
