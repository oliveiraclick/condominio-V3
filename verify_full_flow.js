
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynpogzyojijqzrngsnac.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlucG9nenlvamlqcXpybmdzbmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4Mjc5MDYsImV4cCI6MjA4MTQwMzkwNn0.mSG0dzO9A-SAUlqgmTmx-tUV6XlnKM2ieliAbzYYdoE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyFlow() {
    console.log('🧪 Starting Full Flow Verification...');

    // 1. Find or create a test professional
    // We'll try to find an existing one to avoid pollution, or create a temp one.
    // Ideally we use a known test user if possible.
    // Let's search for a user with 'teste' in name or a specific ID if known.
    // For safety, let's just pick the first professional found.
    const { data: pros, error: errPro } = await supabase.from('profiles').select('*').eq('role', 'professional').limit(1);

    if (errPro || !pros || pros.length === 0) {
        console.error('❌ Could not find a professional to test with.');
        return;
    }

    const testPro = pros[0];
    console.log(`👤 Using professional: ${testPro.name} (${testPro.id})`);

    // 2. Set is_on_site = true and check timestamp update (Trigger Test)
    console.log('🔹 Setting is_on_site = true...');
    const { error: updateErr1 } = await supabase.from('profiles').update({ is_on_site: true }).eq('id', testPro.id);
    if (updateErr1) { console.error('❌ Update failed', updateErr1); return; }

    // Fetch again to check timestamp
    const { data: proAfterUpdate } = await supabase.from('profiles').select('on_site_updated_at').eq('id', testPro.id).single();
    const timeDiff = Math.abs(new Date().getTime() - new Date(proAfterUpdate.on_site_updated_at).getTime());

    if (timeDiff < 60000) { // Less than 1 minute difference
        console.log('✅ Trigger Verified: Timestamp updated automatically.');
    } else {
        console.error('❌ Trigger Failed: Timestamp not updated correctly.', proAfterUpdate.on_site_updated_at);
    }

    // 3. Manually age the timestamp to > 1 hour ago
    console.log('🔹 Aging timestamp to 70 minutes ago...');
    const oldDate = new Date(Date.now() - 70 * 60 * 1000).toISOString();
    const { error: updateErr2 } = await supabase.from('profiles').update({ on_site_updated_at: oldDate }).eq('id', testPro.id);
    if (updateErr2) { console.error('❌ Failed to age timestamp', updateErr2); return; }

    // 4. Run the Auto-Disable Function
    console.log('🔹 Running Auto-Disable RPC...');
    const { error: rpcErr } = await supabase.rpc('auto_disable_expired_onsite_status');
    if (rpcErr) { console.error('❌ RPC Failed', rpcErr); return; }

    // 5. Verify is_on_site is now false
    const { data: finalPro } = await supabase.from('profiles').select('is_on_site').eq('id', testPro.id).single();

    if (finalPro.is_on_site === false) {
        console.log('✅ Auto-Disable Verified: User is now off-site.');
    } else {
        console.error('❌ Auto-Disable Failed: User is still on-site.');
    }

    // Cleanup (Reset to off-site just in case)
    await supabase.from('profiles').update({ is_on_site: false }).eq('id', testPro.id);
    console.log('🏁 Verification Complete.');
}

verifyFlow();
