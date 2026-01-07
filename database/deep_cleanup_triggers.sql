-- 🔍 DIAGNÓSTICO E LIMPEZA PROFUNDA (Auth & Triggers)

-- 1. IDENTIFICAR GATILHOS: Vamos ver o que REALMENTE existe na tabela de usuários
-- Copie os nomes que aparecerem aqui se o erro persistir.
SELECT tgname as gatilho_encontrado
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass;

-- 2. DESATIVAR TUDO: Vamos remover qualquer coisa que possa causar erro 500
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
-- Adicionando quedas para nomes genéricos que o Supabase às vezes usa
DROP TRIGGER IF EXISTS supabase_realtime_auth_users ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3. LIMPAR O USUÁRIO (Para criar um teste 100% novo)
DELETE FROM public.profiles WHERE email = 'ia.oliveira.click@gmail.com';
DELETE FROM auth.users WHERE email = 'ia.oliveira.click@gmail.com';

-- 4. REFRESH NO SCHEMA: Vamos forçar o banco a ler a estrutura de novo
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role_check text;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role_check;

-- 5. CONFIGURAÇÃO MÍNIMA: Apenas o necessário para não quebrar
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'resident';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS condominium_id UUID;

SELECT 'Gatilhos removidos e usuário limpo! Agora, dê um F5 e tente fazer o CADASTRO do zero.' as resultado;
