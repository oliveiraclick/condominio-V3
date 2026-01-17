// =====================================================
// Edge Function: Auto-disable expired onsite status
// =====================================================
// Esta função deve ser chamada periodicamente (a cada 5-10 min)
// via Supabase Cron ou serviço externo como cron-job.org
// =====================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
    try {
        // Cria cliente Supabase com service_role key (necessário para RPC)
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Chama a função SQL que desliga tags expiradas
        const { data, error } = await supabase.rpc('auto_disable_expired_onsite_status');

        if (error) {
            console.error('Erro ao executar auto_disable:', error);
            return new Response(
                JSON.stringify({ success: false, error: error.message }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        console.log('✅ Auto-disable executado com sucesso');

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Prestadores expirados foram desativados',
                timestamp: new Date().toISOString()
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (err) {
        console.error('Erro fatal:', err);
        return new Response(
            JSON.stringify({ success: false, error: err.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});

// =====================================================
// COMO USAR:
// =====================================================
// 1. Deploy esta função no Supabase Functions
// 2. Configure um cron job para chamar esta URL a cada 5-10 min
//    Exemplo: https://seu-projeto.supabase.co/functions/v1/auto-disable-onsite
//
// Serviços de Cron gratuitos:
// - cron-job.org
// - EasyCron
// - GitHub Actions (com schedule)
// =====================================================
