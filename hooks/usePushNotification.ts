import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

export function usePushNotification() {
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [loading, setLoading] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            setPermission(Notification.permission);
            checkSubscription();
        }
    }, []);

    async function checkSubscription() {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        setSubscription(sub);
    }

    async function subscribe() {
        if (!isSupported) return alert('Push Notifications não suportadas neste navegador.');
        if (!VAPID_PUBLIC_KEY) return alert('VAPID Key não configurada (VITE_VAPID_PUBLIC_KEY).');

        setLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;

            // Request Permission
            const perm = await Notification.requestPermission();
            setPermission(perm);

            if (perm === 'granted') {
                // Subscribe
                const sub = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                });

                setSubscription(sub);

                // Save to Database
                await saveSubscriptionToDb(sub);
                alert('Notificações ativadas com sucesso!');
            } else {
                alert('Permissão de notificação negada.');
            }
        } catch (error) {
            console.error('Erro ao subscrever:', error);
            alert('Erro ao ativar notificações. Veja o console.');
        } finally {
            setLoading(false);
        }
    }

    async function unsubscribe() {
        if (!subscription) return;
        setLoading(true);
        try {
            await subscription.unsubscribe();
            setSubscription(null);
            // Optional: Remove from DB
        } catch (error) {
            console.error('Erro ao cancelar subscrição:', error);
        } finally {
            setLoading(false);
        }
    }

    async function saveSubscriptionToDb(sub: PushSubscription) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return; // Must be logged in

        const { error } = await supabase.from('push_subscriptions').upsert({
            user_id: user.id,
            endpoint: sub.endpoint,
            p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(sub.getKey('p256dh') as ArrayBuffer) as any)),
            auth: btoa(String.fromCharCode.apply(null, new Uint8Array(sub.getKey('auth') as ArrayBuffer) as any)),
            user_agent: navigator.userAgent
        }, { onConflict: 'endpoint' });

        if (error) console.error('Erro ao salvar no Supabase:', error);
    }

    return { isSupported, permission, subscription, subscribe, unsubscribe, loading };
}

// Utility
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
