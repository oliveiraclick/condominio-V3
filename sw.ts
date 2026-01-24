import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { NavigationRoute, registerRoute } from 'workbox-routing';

declare let self: ServiceWorkerGlobalScope;

// --- CONFIGURAÇÃO PWA ---
self.skipWaiting();
clientsClaim();

// Precaching (gerado automaticamente pelo VitePluginPWA)
// @ts-ignore
const manifest = self.__WB_MANIFEST;
if (manifest) {
    precacheAndRoute(manifest);
    cleanupOutdatedCaches();
}

// Roteamento de Navegação (SPA fallback)
// registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html')));

// --- EVENTO PUSH (Receber Notificação) ---
self.addEventListener('push', (event) => {
    let data = { title: 'Nova Notificação', body: 'Você tem uma nova mensagem!', icon: '/icon.png', url: '/' };

    if (event.data) {
        try {
            const payload = event.data.json();
            data = { ...data, ...payload };
        } catch (e) {
            data.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon,
            data: { url: data.url }, // URL para abrir ao clicar
            vibrate: [200, 100, 200],
            badge: '/icon.png',
            tag: 'renata-condo-app'
        })
    );
});

// --- EVENTO CLICK (Abrir App) ---
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Se já tiver uma janela aberta, foca nela
            if (clientList.length > 0) {
                let client = clientList[0];
                for (const c of clientList) {
                    if (c.focused) {
                        client = c;
                    }
                }
                return client.focus();
            }
            // Se não, abre uma nova
            return self.clients.openWindow(event.notification.data.url || '/');
        })
    );
});
