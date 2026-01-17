// =====================================================
// Script Node.js: Auto-disable expired onsite status
// =====================================================
// Este script pode ser executado manualmente ou via cron
// Exemplo de cron (a cada 10 minutos):
// */10 * * * * cd /path/to/project && node auto_disable_onsite.js
// =====================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynpogzyojijqzrngsnac.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlucG9nenlvamlqcXpybmdzbmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4Mjc5MDYsImV4cCI6MjA4MTQwMzkwNn0.mSG0dzO9A-SAUlqgmTmx-tUV6XlnKM2ieliAbzYYdoE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function autoDisableExpiredOnsite() {
    console.log(`[${new Date().toISOString()}] 🔄 Starting Auto-Disable Check...`);

    try {
        // Call the Database Function via RPC
        // This ensures the logic in the DB (single source of truth) is executed.
        const { error } = await supabase.rpc('auto_disable_expired_onsite_status');

        if (error) {
            console.error('❌ Error executing auto-disable function:', error);
            return;
        }

        console.log('✅ Auto-disable function executed successfully.');

    } catch (err) {
        console.error('❌ Fatal error:', err);
    }
}

// Executa a função
autoDisableExpiredOnsite();
