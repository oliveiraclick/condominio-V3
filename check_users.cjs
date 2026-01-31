const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) { process.exit(1); }

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking "Denys Cesar"...');
    const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role, unit')
        .ilike('name', '%Denys Cesar%');

    if (error) console.error(error);
    else console.table(data);

    // Also check Denys SuperAdmin
    const { data: data2 } = await supabase
        .from('profiles')
        .select('id, name, role, unit')
        .ilike('name', '%SuperAdmin%');

    console.log('Checking "SuperAdmin"...');
    console.table(data2);
}

check();
