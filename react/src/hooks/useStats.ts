import { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { Item, Expense } from '../types';
import { useAuth } from '../contexts/AuthContext';

export interface ProductAnalysis {
    name: string;
    selling_price: number;
    unit_variable_cost: number; // CostPrice
    sales_count: number;
    total_revenue: number;
    total_variable_cost: number;
    allocated_fixed_cost: number;
    total_profit: number;
    margin_rate: number;
}

export const useStats = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const fetchMonthStats = useCallback(async (year: number, month: number, isForecast: boolean) => {
        if (!user) return null;
        setLoading(true);
        try {
            const startOfMonth = new Date(year, month, 1).toISOString();
            const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

            // 1. Fetch Expenses
            const { data: expenses } = await supabase
                .from('Expenses')
                .select('*')
                .eq('user_id', user.id)
                .gte('expense_date', startOfMonth)
                .lte('expense_date', endOfMonth)
                .returns<Expense[]>();

            let totalOperatingExpenses = 0;
            let totalInventoryLoss = 0;

            (expenses || []).forEach((e: Expense) => {
                if (e.category === '재고손실') {
                    totalInventoryLoss += e.amount;
                } else {
                    totalOperatingExpenses += e.amount;
                }
            });

            // 2. Fetch Products
            const { data: products } = await supabase
                .from('Items')
                .select('*')
                .eq('user_id', user.id)
                .eq('type', 'Product')
                .returns<Item[]>();

            if (!products) return null;

            // 3. Aggregate Sales
            const salesMap: Record<string, number> = {};
            if (isForecast) {
                products.forEach((p: Item) => {
                    salesMap[p.name] = p.estimated_monthly_sales || 0;
                });
            } else {
                const { data: orders } = await supabase
                    .from('Orders')
                    .select('id')
                    .eq('shop_id', user.id)
                    .gte('created_at', startOfMonth)
                    .lte('created_at', endOfMonth)
                    .not('status', 'eq', '취소');

                const orderIds = (orders || []).map(o => o.id);
                if (orderIds.length > 0) {
                    const { data: orderItems } = await supabase
                        .from('OrderItems')
                        .select('*')
                        .in('order_id', orderIds);

                    (orderItems || []).forEach(oi => {
                        salesMap[oi.item_name] = (salesMap[oi.item_name] || 0) + oi.quantity;
                    });
                }
            }

            return {
                products,
                totalOperatingExpenses,
                totalInventoryLoss,
                salesMap
            };
        } catch (err) {
            console.error(err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [user]);

    return { loading, fetchMonthStats };
};
