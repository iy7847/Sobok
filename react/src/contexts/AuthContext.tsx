import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '../types';

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    updateProfile: (profile: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    signOut: async () => { },
    updateProfile: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            // Fallback timeout in case Supabase is unreachable
            const timeoutId = setTimeout(() => {
                if (mounted) {
                    console.warn('Auth initialization timed out, defaulting to null user.');
                    setLoading(false);
                }
            }, 3000);

            try {
                // Check active sessions and sets the user
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Error fetching session:', error);
                    throw error;
                }

                if (mounted) {
                    setUser(session?.user ?? null);
                    if (session?.user) {
                        fetchProfile(session.user.id); // fire and forget
                    }
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
                if (mounted) setUser(null);
            } finally {
                clearTimeout(timeoutId);
                if (mounted) setLoading(false);
            }
        };

        initializeAuth();

        // Listen for changes on auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (mounted) {
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                }
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from('Profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
        } else {
            setProfile(data);
        }
    };

    const updateProfile = (newProfile: Partial<UserProfile>) => {
        if (profile) {
            setProfile({ ...profile, ...newProfile });
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const value = {
        user,
        profile,
        loading,
        signOut,
        updateProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
