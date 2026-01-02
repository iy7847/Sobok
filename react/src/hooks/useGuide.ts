import { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';

export interface GuideItem {
    id: number;
    title: string;
    content: string;
    icon_name?: string;
    display_order: number;
}

export const useGuide = (pageId: string) => {
    const [guides, setGuides] = useState<GuideItem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchGuides = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('HelpGuides')
                .select('*')
                .eq('page_id', pageId)
                .order('display_order', { ascending: true });

            if (error) {
                console.error('Error fetching guides:', error);
                return;
            }

            if (data) {
                setGuides(data);
            }
        } catch (err) {
            console.error('Unexpected error fetching guides:', err);
        } finally {
            setLoading(false);
        }
    }, [pageId]);

    return { guides, fetchGuides, loading };
};
