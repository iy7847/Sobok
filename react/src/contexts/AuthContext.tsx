import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
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
    const userIdRef = useRef<string | null>(null);

    // Sync ref with user state
    useEffect(() => {
        userIdRef.current = user?.id || null;
    }, [user]);

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            // Fallback timeout in case Supabase is unreachable
            const timeoutId = setTimeout(() => {
                if (mounted) {
                    console.warn('[Auth] Initialization timed out (30s). Check network connection.');
                    setLoading(false);
                }
            }, 30000);

            try {
                console.log('[Auth] Initializing session check...');
                // Check active sessions and sets the user
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('[Auth] Error fetching session:', error);
                    throw error;
                }

                if (mounted) {
                    if (session?.user) {
                        console.log("저장된 세션 복구됨"); // User requested log
                        console.log('[Auth] Session found for user:', session.user.id);
                        setUser(prev => prev?.id === session.user.id ? prev : session.user);
                        // Non-blocking profile fetch to speed up initial load
                        fetchProfile(session.user.id);
                    } else {
                        console.log('[Auth] No active session found.');
                        setUser(null);
                    }
                }
            } catch (err) {
                console.error('[Auth] Initialization error:', err);
                if (mounted) setUser(null);
            } finally {
                clearTimeout(timeoutId);
                if (mounted) setLoading(false);
            }
        };

        initializeAuth();

        // Listen for changes on auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`[Auth] Auth state changed: ${event}`, session?.user?.id);

            // Ignore redundant events if user is already same
            if (session?.user?.id && session.user.id === userIdRef.current) {
                console.log('[Auth] Ignoring redundant auth change (same user)');
                return;
            }

            if (mounted) {
                const newUser = session?.user ?? null;
                // Only update if ID changed (though the check above handles most cases)
                setUser(prev => prev?.id === newUser?.id ? prev : newUser);

                if (newUser) {
                    // Non-blocking profile fetch
                    fetchProfile(newUser.id);
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
            console.error('[Auth] Error fetching profile:', error);
        } else {
            console.log('[Auth] Profile fetched successfully');
            setProfile(prev => JSON.stringify(prev) === JSON.stringify(data) ? prev : data);
        }
    };

    const updateProfile = useCallback((newProfile: Partial<UserProfile>) => {
        if (profile) {
            setProfile({ ...profile, ...newProfile });
        }
    }, [profile]);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
    }, []);

    const value = useMemo(() => ({
        user,
        profile,
        loading,
        signOut,
        updateProfile,
    }), [user, profile, loading, signOut, updateProfile]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
