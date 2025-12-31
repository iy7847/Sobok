import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        products: 0,
        components: 0,
        materials: 0,
        activeOrders: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Count items by type
            const { data: items, error: itemError } = await supabase
                .from('Items')
                .select('type')
                .eq('user_id', user.id);

            if (itemError) throw itemError;

            const counts = (items || []).reduce((acc: any, item: any) => {
                const type = item.type.toLowerCase() + 's';
                acc[type] = (acc[type] || 0) + 1;
                return acc;
            }, { products: 0, components: 0, materials: 0 });

            // Count active orders
            const { count: orderCount, error: orderError } = await supabase
                .from('Orders')
                .select('*', { count: 'exact', head: true })
                .eq('shop_id', user.id)
                .neq('status', 'Completed');

            if (orderError) throw orderError;

            setStats({
                ...counts,
                activeOrders: orderCount || 0
            });
        } catch (err: any) {
            console.error('Dash stats error:', err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, loading };
};
