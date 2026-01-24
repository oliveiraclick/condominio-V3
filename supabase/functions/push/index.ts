import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import webpush from "https://esm.sh/web-push@3.5.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 1. Configurar Web Push
        const vapidEmail = Deno.env.get('VAPID_EMAIL') || 'admin@condoconnect.com';
        const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
        const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

        if (!vapidPublicKey || !vapidPrivateKey) {
            throw new Error('VAPID keys not configured');
        }

        webpush.setVapidDetails(
            `mailto:${vapidEmail}`,
            vapidPublicKey,
            vapidPrivateKey
        );

        // 2. Obter dados da notificação (payload do Webhook ou Direct Call)
        const payload = await req.json();

        // Suporta chamada direta ou via Database Webhook (record)
        const notificationData = payload.record || payload;

        const { title, body, target_role, icon, url } = notificationData;

        console.log(`Sending notification: ${title} to role: ${target_role}`);

        // 3. Conectar ao Supabase
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 4. Buscar Subscrições
        let query = supabase.from('push_subscriptions').select('*, profiles:user_id(role)');

        // Filtrar por Role se necessário
        // Nota: Como 'profiles' é one-to-one, podemos filtrar no endpoint ou aqui.
        // Mas push_subscriptions tem user_id. Precisamos saber o role desse user.
        // Se o target_role for 'all', pegamos todos.
        // Se for específico, precisamos filtrar.

        // Simplificação: Pegamos todos e filtramos no código se target_role != 'all'
        const { data: subscriptions, error: subError } = await query;

        if (subError) throw subError;

        if (!subscriptions || subscriptions.length === 0) {
            return new Response(JSON.stringify({ message: 'No subscriptions found' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 5. Filtrar e Enviar
        const notifications = [];

        for (const sub of subscriptions) {
            // Check Role
            if (target_role !== 'all') {
                // Assumindo que profiles.role existe. Se não, pule.
                // Se a query join retornou profiles como array ou objeto:
                const userRole = sub.profiles?.role; // Ajuste conforme seu schema real
                if (userRole !== target_role) continue;
            }

            // Construct PushSubscription object
            const pushConfig = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: atob(sub.p256dh), // Decode Base64 stored in DB back to string for web-push (Wait, web-push needs string or buffer? It needs keys object usually)
                    auth: atob(sub.auth)
                }
            };

            // Nota: web-push espera keys como strings (se base64 encoded) ou buffers.
            // Como salvamos em base64 no DB (btoa), precisamos passar o valor correto.
            // O hook frontend salvou com btoa().

            const payloadString = JSON.stringify({
                title,
                body,
                icon: icon || '/icon.png',
                url: url || '/'
            });

            notifications.push(
                webpush.sendNotification(pushConfig, payloadString)
                    .catch(err => {
                        console.error('Error sending to', sub.id, err);
                        if (err.statusCode === 410 || err.statusCode === 404) {
                            // Expired subscription, remove from DB
                            return supabase.from('push_subscriptions').delete().eq('id', sub.id);
                        }
                    })
            );
        }

        await Promise.all(notifications);

        return new Response(JSON.stringify({ message: `Sent ${notifications.length} notifications` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
