import { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { Order, OrderItem } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useOrders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = useCallback(async (options?: {
        startDate?: string;
        endDate?: string;
        status?: string | 'All'
    }) => {
        if (!user) return;
        setLoading(true);
        try {
            let query = supabase
                .from('Orders')
                .select('*, Items:OrderItems(*)')
                .eq('shop_id', user.id)
                .order('created_at', { ascending: false });

            if (options?.startDate) {
                query = query.gte('created_at', options.startDate);
            }
            if (options?.endDate) {
                query = query.lte('created_at', options.endDate);
            }
            if (options?.status && options.status !== 'All') {
                query = query.eq('status', options.status);
            }

            const { data, error } = await query;

            if (error) throw error;
            setOrders(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const updateOrderStatus = async (orderId: string, status: string, remarks?: string) => {
        try {
            const { error } = await supabase
                .from('Orders')
                .update({ status, remarks })
                .eq('id', orderId);

            if (error) throw error;
            await fetchOrders();
        } catch (err: any) {
            alert(`상태 업데이트 실패: ${err.message}`);
        }
    };

    const updateOrderDetails = async (order: Partial<Order>, items: OrderItem[]) => {
        try {
            const { error: orderError } = await supabase
                .from('Orders')
                .update({
                    customer_name: order.customer_name,
                    customer_phone: order.customer_phone,
                    total_amount: order.total_amount,
                    remarks: order.remarks,
                })
                .eq('id', order.id);

            if (orderError) throw orderError;

            for (const item of items) {
                const { error: itemError } = await supabase
                    .from('OrderItems')
                    .update({ quantity: item.quantity })
                    .eq('id', item.id);
                if (itemError) throw itemError;
            }

            await fetchOrders();
        } catch (err: any) {
            alert(`주문 수정 실패: ${err.message}`);
        }
    };

    return { orders, loading, error, fetchOrders, updateOrderStatus, updateOrderDetails };
};
