
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynpogzyojijqzrngsnac.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlucG9nenlvamlqcXpybmdzbmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4Mjc5MDYsImV4cCI6MjA4MTQwMzkwNn0.mSG0dzO9A-SAUlqgmTmx-tUV6XlnKM2ieliAbzYYdoE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTrigger() {
    console.log('🧪 Verifying Trigger...');

    // Pick a pro
    const { data: pros } = await supabase.from('profiles').select('*').eq('role', 'professional').limit(1);
    if (!pros || pros.length === 0) return console.error('No pro found');
    const id = pros[0].id;

    // RESET: Set to FALSE
    console.log('1. Resetting to FALSE...');
    await supabase.from('profiles').update({ is_on_site: false }).eq('id', id);

    // Set to TRUE
    console.log('2. Setting to TRUE...');
    const { error } = await supabase.from('profiles').update({ is_on_site: true }).eq('id', id);

    if (error) return console.error('Update failed', error);

    // Check Timestamp
    const { data: pro } = await supabase.from('profiles').select('on_site_updated_at').eq('id', id).single();

    const now = new Date();
    const ts = new Date(pro.on_site_updated_at);
    const diff = Math.abs(now - ts);

    console.log(`Timestamp: ${ts.toISOString()}`);
    console.log(`Current:   ${now.toISOString()}`);
    console.log(`Diff (ms): ${diff}`);

    if (diff < 30000) {
        console.log('✅ Trigger WORKS! Timestamp updated.');
    } else {
        console.log('❌ Trigger FAILED! Timestamp is old.');
    }
}

verifyTrigger();
