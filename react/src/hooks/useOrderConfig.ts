import { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { FormElement } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useOrderConfig = () => {
    const { user, profile, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [elements, setElements] = useState<FormElement[]>([]);
    const [basicInfo, setBasicInfo] = useState({
        company_name: '',
        shop_notice: '',
        bank_account: ''
    });

    const loadConfig = useCallback(async () => {
        if (!profile) return;
        setBasicInfo({
            company_name: profile.company_name || '',
            shop_notice: profile.shop_notice || '',
            bank_account: profile.bank_account || ''
        });
        if (profile.order_form_config) {
            try {
                setElements(JSON.parse(profile.order_form_config));
            } catch (e) {
                setElements([]);
            }
        }
    }, [profile]);

    const saveConfig = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const updates = {
                ...basicInfo,
                order_form_config: JSON.stringify(elements)
            };

            const { error } = await supabase
                .from('Profiles')
                .update(updates)
                .eq('id', user.id);

            if (error) throw error;

            // Update local profile context
            if (updateProfile) {
                updateProfile(updates);
            }

            alert('저장되었습니다!');
        } catch (err: any) {
            alert(`저장 실패: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const addElement = (type: string, label: string) => {
        if (type === 'FileUpload') {
            const fileUploadCount = elements.filter(e => e.type === 'FileUpload').length;
            if (fileUploadCount >= 5) {
                alert('사진 첨부 항목은 최대 5개까지만 추가할 수 있습니다.\n(서버 용량 및 성능 최적화를 위한 제한입니다)');
                return;
            }
        }

        const newElement: FormElement = {
            id: Date.now().toString(),
            type,
            label,
            required: false,
            options: ''
        };
        setElements([...elements, newElement]);
    };

    const removeElement = (id: string) => {
        setElements(elements.filter(e => e.id !== id));
    };

    const updateElement = (id: string, updates: Partial<FormElement>) => {
        setElements(elements.map(e => e.id === id ? { ...e, ...updates } : e));
    };

    const moveElement = (from: number, to: number) => {
        const newElements = [...elements];
        const [removed] = newElements.splice(from, 1);
        newElements.splice(to, 0, removed);
        setElements(newElements);
    };

    return {
        loading,
        elements,
        basicInfo,
        setBasicInfo,
        loadConfig,
        saveConfig,
        addElement,
        removeElement,
        updateElement,
        moveElement,
        setElements
    };
};
