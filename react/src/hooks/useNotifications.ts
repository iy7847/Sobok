import { useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase config from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const useNotifications = () => {
    const { user } = useAuth();

    useEffect(() => {
        if (!user || user.email === 'public@sobok.com') return;

        const setupNotifications = async () => {
            try {
                // 1. Request Permission
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    console.log('Notification permission denied');
                    return;
                }

                // 2. Get FCM Token
                // Register Service Worker with correct scope for /Sobok/ subpath
                const swUrl = `${import.meta.env.BASE_URL}firebase-messaging-sw.js`;
                const registration = await navigator.serviceWorker.register(swUrl);

                // VAPID Key from Firebase Console
                const token = await getToken(messaging, {
                    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
                    serviceWorkerRegistration: registration
                });

                if (token) {
                    console.log('FCM Token:', token);
                    // 3. Save Token to Supabase
                    const { error } = await supabase
                        .from('user_fcm_tokens')
                        .upsert({
                            user_id: user.id,
                            token: token,
                            device_type: navigator.userAgent
                        }, { onConflict: 'token' });

                    if (error) console.error('Error saving FCM token:', error);
                }
            } catch (error) {
                console.error('Error setting up notifications:', error);
            }
        };

        setupNotifications();

        // 4. Handle Foreground Messages
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Foreground Message:', payload);
            const { title, body } = payload.data || {};
            if (title && body) {
                const notification = new Notification(title, {
                    body,
                    icon: '/logo.png'
                });

                notification.onclick = (event) => {
                    event.preventDefault(); // Prevent browser from focusing the Notification's tab (if separate)
                    // Navigate to Orders page
                    window.location.href = '/Sobok/orders';
                    window.focus();
                };
            }
        });

        return () => {
            unsubscribe();
        };
    }, [user]);
};
