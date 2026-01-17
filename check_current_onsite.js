import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynpogzyojijqzrngsnac.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlucG9nenlvamlqcXpybmdzbmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4Mjc5MDYsImV4cCI6MjA4MTQwMzkwNn0.mSG0dzO9A-SAUlqgmTmx-tUV6XlnKM2ieliAbzYYdoE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCurrentOnsite() {
    console.log('🔍 Verificando prestadores atualmente "No Condomínio"...\n');

    // Query EXATA que o App.tsx usa agora (após correção)
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'professional')
        .eq('is_on_site', true);

    if (error) {
        console.log('❌ Erro:', error);
        return;
    }

    if (!data || data.length === 0) {
        console.log('⚠️  Nenhum prestador "No Condomínio" no momento');
        console.log('\n💡 Para testar:');
        console.log('   1. Faça login como prestador');
        console.log('   2. Ative o toggle "No Condomínio"');
        console.log('   3. Volte como morador e veja aparecer na home');
    } else {
        console.log(`✅ ${data.length} prestador(es) "No Condomínio" agora:\n`);
        data.forEach((pro, i) => {
            console.log(`${i + 1}. ${pro.name}`);
            console.log(`   📧 ${pro.email}`);
            console.log(`   🏷️  Categoria: ${pro.category || 'Não definida'}`);
            console.log(`   📱 Telefone: ${pro.phone || 'Não informado'}`);
            console.log(`   ⏰ Ativado em: ${new Date(pro.on_site_updated_at).toLocaleString('pt-BR')}`);
            console.log('');
        });

        console.log('✨ Estes prestadores devem aparecer na seção "PRESTADORES NO CONDOMÍNIO"');
    }
}

checkCurrentOnsite();
