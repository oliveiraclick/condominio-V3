import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '../supabase';

export const PushNotificationService = {
    initialized: false,

    // Initialize Push Notifications
    init: async () => {
        if (PushNotificationService.initialized) return;
        PushNotificationService.initialized = true;

        console.log('PushNotificationService: Initializing...');

        // Check permission status
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
            console.warn('PushNotificationService: Permission not granted');
            return;
        }

        // Register with Apple / Google to receive push via APNS/FCM
        await PushNotifications.register();

        // Listeners
        PushNotificationService.addListeners();
    },

    addListeners: () => {
        // On registration success: Save token to Supabase
        PushNotifications.addListener('registration', async (token) => {
            console.log('PushNotificationService: Registration success, token:', token.value);
            await PushNotificationService.saveToken(token.value);
        });

        // On registration error
        PushNotifications.addListener('registrationError', (error) => {
            console.error('PushNotificationService: Registration error: ', error);
        });

        // On notification received (foreground)
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('PushNotificationService: Notification received: ', notification);
            // Determine if we should show a local alert or update UI state
        });

        // On notification action performed (tap)
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            console.log('PushNotificationService: Notification action performed', notification);
            // Handle deep linking or navigation here
            // For now, we can just log it or maybe emit a custom event to App.tsx
        });
    },

    saveToken: async (token: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.warn('PushNotificationService: No user logged in, cannot save token');
                return;
            }

            // Upsert token to push_subscriptions table
            // We assume the table has a unique restriction on 'endpoint' or we handle duplicates.
            // Based on SQL, endpoint is unique.
            // However, token.value from Capacitor is the 'device token'.
            // We will map 'endpoint' to this token.

            // Check if token already exists for this user to avoid unnecessary writes
            // or just upsert.

            const { error } = await supabase
                .from('push_subscriptions')
                .upsert({
                    user_id: user.id,
                    endpoint: token, // Using 'endpoint' to store the device token for simplicity, match SQL schema
                    p256dh: 'unused-for-native', // These fields are for Web Push, likely unused for native but required by schema
                    auth: 'unused-for-native',   // We can put placeholder values or optional
                    user_agent: navigator.userAgent
                }, {
                    onConflict: 'endpoint' // Ensure unique endpoint
                });

            if (error) {
                throw error;
            }

            console.log('PushNotificationService: Token saved to Supabase');
        } catch (error) {
            console.error('PushNotificationService: Error saving token:', error);
        }
    }
};
