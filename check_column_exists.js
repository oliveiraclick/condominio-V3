import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynpogzyojijqzrngsnac.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlucG9nenlvamlqcXpybmdzbmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4Mjc5MDYsImV4cCI6MjA4MTQwMzkwNn0.mSG0dzO9A-SAUlqgmTmx-tUV6XlnKM2ieliAbzYYdoE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumn() {
    console.log('🔍 Verificando coluna on_site_updated_at...\n');

    // Tenta buscar um prestador online COM a coluna
    const { data, error } = await supabase
        .from('profiles')
        .select('id, name, is_on_site, on_site_updated_at')
        .eq('role', 'professional')
        .eq('is_on_site', true)
        .limit(1);

    if (error) {
        console.log('❌ ERRO ao buscar com on_site_updated_at:');
        console.log('   Mensagem:', error.message);
        console.log('   Código:', error.code);
        console.log('\n⚠️  A coluna on_site_updated_at provavelmente NÃO EXISTE!\n');
    } else {
        console.log('✅ Coluna on_site_updated_at existe!');
        console.log('   Dados:', data);
    }

    // Agora tenta SEM o filtro de data
    console.log('\n🔍 Buscando prestadores online SEM filtro de data...\n');

    const { data: data2, error: error2 } = await supabase
        .from('profiles')
        .select('id, name, is_on_site')
        .eq('role', 'professional')
        .eq('is_on_site', true);

    if (error2) {
        console.log('❌ Erro:', error2);
    } else {
        console.log(`✅ Encontrados ${data2.length} prestadores online`);
        data2.forEach(p => console.log(`   - ${p.name}`));
    }
}

checkColumn();
