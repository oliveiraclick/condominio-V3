import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynpogzyojijqzrngsnac.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlucG9nenlvamlqcXpybmdzbmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4Mjc5MDYsImV4cCI6MjA4MTQwMzkwNn0.mSG0dzO9A-SAUlqgmTmx-tUV6XlnKM2ieliAbzYYdoE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
    console.log('🧪 Testando query CORRIGIDA (sem filtro de tempo)...\n');

    // Query NOVA (sem filtro de tempo)
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'professional')
        .eq('is_on_site', true);

    if (error) {
        console.log('❌ Erro:', error);
    } else {
        console.log(`✅ SUCESSO! Encontrados ${data.length} prestadores online:\n`);
        data.forEach((pro, i) => {
            console.log(`${i + 1}. ${pro.name}`);
            console.log(`   📧 ${pro.email}`);
            console.log(`   🏷️  Categoria: ${pro.category || 'Não definida'}`);
            console.log(`   🟢 is_on_site: ${pro.is_on_site}`);
            console.log(`   ⏰ on_site_updated_at: ${pro.on_site_updated_at || 'NULL'}`);
            console.log('');
        });

        console.log('\n✨ Agora TODOS os prestadores com is_on_site=true aparecem para os moradores!');
    }
}

testQuery();
