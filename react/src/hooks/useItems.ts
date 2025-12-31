import { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { Item } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useItems = () => {
    const { user } = useAuth();
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('Items')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setItems(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const saveItem = async (item: Partial<Item>) => {
        if (!user) return;
        try {
            if (item.type === 'Material' && item.purchase_price && item.purchase_qty) {
                item.cost_price = item.purchase_price / (item.purchase_qty * (item.usage_qty || 1));
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

    return { items, loading, error, fetchItems, saveItem, deleteItem };
};
