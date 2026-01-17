import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynpogzyojijqzrngsnac.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlucG9nenlvamlqcXpybmdzbmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4Mjc5MDYsImV4cCI6MjA4MTQwMzkwNn0.mSG0dzO9A-SAUlqgmTmx-tUV6XlnKM2ieliAbzYYdoE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOnlineProfessionals() {
    console.log('🔍 Verificando prestadores com tag "online" ativa...\n');

    const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, phone, category, is_on_site, created_at')
        .eq('role', 'professional')
        .eq('is_on_site', true);

    if (error) {
        console.error('❌ Erro ao buscar:', error);
        return;
    }

    if (!data || data.length === 0) {
        console.log('⚠️  Nenhum prestador com tag "online" (is_on_site = true) encontrado.\n');
    } else {
        console.log(`✅ Encontrados ${data.length} prestador(es) com tag "online" ativa:\n`);
        data.forEach((prof, index) => {
            console.log(`${index + 1}. ${prof.name}`);
            console.log(`   📧 Email: ${prof.email}`);
            console.log(`   📱 Telefone: ${prof.phone || 'Não informado'}`);
            console.log(`   🏷️  Categoria: ${prof.category || 'Não definida'}`);
            console.log(`   🟢 Status: NO CONDOMÍNIO (is_on_site = true)`);
            console.log(`   📅 Cadastrado em: ${new Date(prof.created_at).toLocaleDateString('pt-BR')}`);
            console.log('');
        });
    }

    // Também vamos verificar TODOS os prestadores
    const { data: allPros, error: error2 } = await supabase
        .from('profiles')
        .select('id, name, is_on_site')
        .eq('role', 'professional');

    if (!error2 && allPros) {
        console.log(`\n📊 Resumo Geral:`);
        console.log(`   Total de prestadores: ${allPros.length}`);
        console.log(`   Online (is_on_site = true): ${allPros.filter(p => p.is_on_site).length}`);
        console.log(`   Offline (is_on_site = false): ${allPros.filter(p => !p.is_on_site).length}`);
    }
}

checkOnlineProfessionals();
