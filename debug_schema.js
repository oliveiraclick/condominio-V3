const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

// Fallback to .env if .env.local fails or doesn't exist
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.from('packages').select('*').limit(1);
    if (error) {
        console.error('Error:', error);
    } else {
        if (data.length === 0) {
            console.log('No packages found to inspect columns. Trying to insert dummy to trigger error with column hint if possible, or just checking empty result.');
        } else {
            console.log('Columns found:', Object.keys(data[0]));
        }
    }
}

check();
