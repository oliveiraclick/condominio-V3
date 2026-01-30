import React from 'react';
import { usePushNotification } from '../hooks/usePushNotification';
import { Bell, BellOff, Loader2 } from 'lucide-react';

export const PushNotificationButton = () => {
    const { isSupported, permission, subscription, subscribe, unsubscribe, loading } = usePushNotification();

    if (!isSupported) return null; // Don't show if not supported

    if (permission === 'denied') {
        return (
            <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-500 bg-rose-50 rounded-xl opacity-50 cursor-not-allowed" disabled>
                <BellOff size={16} /> Notificações Bloqueadas
            </button>
        );
    }

    return (
        <button
            onClick={subscription ? unsubscribe : subscribe}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-sm active:scale-95 ${subscription
                ? 'bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-500'
                : 'bg-brand-600 text-white hover:bg-brand-500 shadow-brand-500/20'
                }`}
        >
            {loading ? (
                <Loader2 size={16} className="animate-spin" />
            ) : subscription ? (
                <>
                    <BellOff size={16} /> Desativar Push
                </>
            ) : (
                <>
                    <Bell size={16} /> Ativar Notificações
                </>
            )}
        </button>
    );
};
