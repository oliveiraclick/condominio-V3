
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynpogzyojijqzrngsnac.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlucG9nenlvamlqcXpybmdzbmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4Mjc5MDYsImV4cCI6MjA4MTQwMzkwNn0.mSG0dzO9A-SAUlqgmTmx-tUV6XlnKM2ieliAbzYYdoE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('--- CHECKING MARKETPLACE ---');
    const { data: marketplace, error: marketError } = await supabase.from('marketplace').select('*').limit(5);
    if (marketError) console.error('Error fetching marketplace:', marketError);
    else console.log(`Marketplace items found: ${marketplace.length}`, marketplace);

    console.log('\n--- CHECKING PRODUCTS ---');
    const { data: products, error: prodError } = await supabase.from('products').select('*').limit(5);
    if (prodError) console.error('Error fetching products:', prodError);
    else console.log(`Products found: ${products.length}`, products);

    console.log('\n--- CHECKING ON-SITE PROS ---');
    const { data: pros, error: proError } = await supabase.from('profiles').select('*').eq('role', 'professional').eq('is_on_site', true);
    if (proError) console.error('Error fetching pros:', proError);
    else console.log(`On-Site Pros found: ${pros.length}`, pros);

    console.log('\n--- CHECKING PROFESSIONAL SERVICES ---');
    const { data: services, error: servError } = await supabase.from('professional_services').select('*').limit(5);
    if (servError) console.error('Error fetching services:', servError);
    else console.log(`Services found: ${services.length}`, services);

    console.log('\n--- CHECKING PROFILES ---');
    const { data: profiles, error: profileError } = await supabase.from('profiles').select('id, name, email, role').limit(10);
    if (profileError) console.error('Error fetching profiles:', profileError);
    else console.log(`Profiles found: ${profiles.length}`, profiles);
}

checkData();
