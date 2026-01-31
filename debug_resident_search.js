
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
    const email = 'denyscoborges@gmail.com';
    console.log(`Checking profile for email: ${email}`);

    // 1. First find the user ID from auth (simulated or if we have access)
    // Since we can't easily query auth.users directly via client without service key usually,
    // we might have to search profiles directly if email is there, but profiles usually doesn't have email.
    // Wait, does profiles have email? Let's check schema.

    // Checking profiles table structure basically
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('name', '%Denys%');

    if (error) {
        console.error('Error fetching profiles:', error);
        return;
    }

    console.log(`Found ${profiles?.length ?? 0} profiles matching 'Denys':`);
    profiles?.forEach(p => {
        console.log(`- ID: ${p.id}`);
        console.log(`  Name: ${p.name}`);
        console.log(`  Unit: ${p.unit}`);
        console.log(`  Tower: ${p.tower}`);
        console.log(`  -------------------`);
    });

    if (profiles?.length === 0) {
        console.log("No profiles found with name 'Denys'. Trying to list all to see what's happening (limit 10).");
        const { data: all, error: errAll } = await supabase.from('profiles').select('*').limit(10);
        if (all) console.log(all);
    }
}

checkUser();
