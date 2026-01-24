
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynpogzyojijqzrngsnac.supabase.co';
// Using the key found in supabase.ts
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlucG9nenlvamlqcXpybmdzbmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4Mjc5MDYsImV4cCI6MjA4MTQwMzkwNn0.mSG0dzO9A-SAUlqgmTmx-tUV6XlnKM2ieliAbzYYdoE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verify() {
    console.log('Verifying Professional Services...');

    // 1. Check Fetch
    const { data: services, error } = await supabase
        .from('professional_services')
        .select(`
            *,
            profiles:provider_id(name, phone, role)
        `)
        .eq('active', true);

    if (error) {
        console.error('Error fetching services:', error);
        return;
    }

    console.log(`Found ${services?.length} Active Services.`);
    if (services && services.length > 0) {
        console.log('--- Sample Service 1 ---');
        console.log(JSON.stringify(services[0], null, 2));
    } else {
        console.log('No active services found. Checking inactive...');
        const { count } = await supabase.from('professional_services').select('*', { count: 'exact', head: true });
        console.log(`Total services in DB (active or not): ${count}`);
    }
}

verify();
