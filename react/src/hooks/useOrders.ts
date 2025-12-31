import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { Order, OrderItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
export const useOrders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const fetchOrders = useCallback(async (options?: {
        startDate?: string;
        endDate?: string;
        status?: string | 'All'
    }) => {
        if (!user) return;

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;
        const signal = controller.signal;

        setLoading(true);
        setError(null);
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
                // Ensure the end date covers the entire day
                query = query.lte('created_at', `${options.endDate}T23:59:59.999Z`);
            }
            if (options?.status && options.status !== 'All') {
                query = query.eq('status', options.status);
            }

            // Soft abort: Ignore result if aborted, but don't kill network request
            const { data, error } = await query;

            if (signal.aborted) return;

            if (error) throw error;
            setOrders(data || []);
        } catch (err: any) {
            if (signal.aborted) {
                // ignore
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

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

    const deleteOrder = async (orderId: string) => {
        try {
            const { error } = await supabase
                .from('Orders')
                .delete()
                .eq('id', orderId);

            if (error) throw error;
            await fetchOrders();
        } catch (err: any) {
            alert(`주문 삭제 실패: ${err.message}`);
            throw err;
        }
    };

    return { orders, loading, error, fetchOrders, updateOrderStatus, updateOrderDetails, deleteOrder };
};
