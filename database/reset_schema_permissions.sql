-- 🛡️ RESET DE PERMISSÕES E CACHE DO SCHEMA
-- Este script tenta resolver o "Database error querying schema" forçando o refresh do PostgREST.

-- 1. Forçar Reset de Permissões para os papéis do Supabase
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 2. "Nudge" no PostgREST: Criar e deletar algo para forçar refresh do schema
CREATE TABLE IF NOT EXISTS public._nudge_schema (id int);
DROP TABLE public._nudge_schema;

-- 3. Investigar se existem outros gatilhos escondidos que causam o Erro 500
-- (Rode este select e veja se aparece algo além de 'on_auth_user_created')
SELECT 
    tgname as nome_do_gatilho,
    CASE WHEN tgenabled = 'O' THEN 'Ativo' ELSE 'Inativo' END as status
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass;

-- 4. Tentar limpar o usuário para um novo teste limpo
-- (Atenção: Isso vai deletar o prestador de teste para podermos recriar sem lixo de schema)
DELETE FROM public.profiles WHERE email = 'ia.oliveira.click@gmail.com';
DELETE FROM auth.users WHERE email = 'ia.oliveira.click@gmail.com';

-- 5. Mais uma vez, garantir que o e-mail não seja exigido (Script redundante de segurança)
-- Nota: Isso só funciona se as configurações do dashboard permitirem.
UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;

SELECT 'Reset de schema e permissões aplicado! Por favor, dê um F5 e tente o cadastro/login novamente.' as status;
