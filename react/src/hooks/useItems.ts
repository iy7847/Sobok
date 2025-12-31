import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { Item } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useItems = () => {
    const { user } = useAuth();
    const [items, setItems] = useState<Item[]>([]);
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

    const fetchItems = useCallback(async () => {
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
            console.log('Fetching items for user:', user.id);
            // Soft abort: Don't pass signal to Supabase to avoid connection closing issues with rapid aborts.
            // We just ignore the result if signal is aborted.
            const { data, error } = await supabase
                .from('Items')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (signal.aborted) return;

            if (error) {
                console.error('Supabase fetch error:', error);
                throw error;
            } else {
                console.log('Fetched items:', data?.length);
                setItems(data || []);
            }
        } catch (err: any) {
            if (signal.aborted) {
                console.log('UseItems Fetch ignored (aborted)');
            } else {
                console.error('Fetch items exception:', err);
                setError(err.message);
            }
        } finally {

            if (!signal.aborted) {
                setLoading(false);
                // We don't nullify the ref here strictly, because a new request might have replaced it.
            }
        }
    }, [user?.id]);

    const saveItem = async (item: Partial<Item>) => {
        if (!user) return;
        try {
            if (item.type === 'Material' && item.purchase_price && item.purchase_qty) {
                // usage_qty is percentage (e.g., 100 means 100%)
                const yieldRatio = (item.usage_qty || 100) / 100;
                item.cost_price = item.purchase_price / (item.purchase_qty * yieldRatio);
            }

            const itemData = { ...item, user_id: user.id };

            let result;
            if (item.id) {
                result = await supabase.from('Items').update(itemData).eq('id', item.id);
            } else {
                result = await supabase.from('Items').insert([itemData]);
            }

            if (result.error) throw result.error;
            await fetchItems();

            // If material price changed, we should ideally trigger a recursive update.
            // For now, let's just refresh.
        } catch (err: any) {
            alert(`저장 실패: ${err.message}`);
        }
    };

    const deleteItem = async (id: number) => {
        try {
            const { error } = await supabase.from('Items').delete().eq('id', id);
            if (error) throw error;
            await fetchItems();
        } catch (err: any) {
            alert(`삭제 실패: ${err.message}`);
        }
    };

    const fetchBOMs = useCallback(async () => {
        if (!user) return [];
        try {
            const { data, error } = await supabase
                .from('BOMs')
                .select(`
                    *,
                    parent_item:parent_item_id!inner(user_id)
                `)
                .eq('parent_item.user_id', user.id);

            if (error) throw error;
            return data as any[]; // strict typing might fail on join, casting for now or update BOM type
        } catch (err: any) {
            console.error('Fetch BOMs error:', err);
            return [];
        }
    }, [user?.id]);

    return { items, loading, error, fetchItems, saveItem, deleteItem, fetchBOMs };
};
