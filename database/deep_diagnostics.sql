-- 1. Verificar Gatilhos (Triggers) no esquema de autenticação
-- Gatilhos mal configurados podem causar erro 500 no login
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table, 
    action_statement 
FROM information_schema.triggers 
WHERE event_object_schema = 'auth';

-- 2. Verificar a estrutura real da tabela profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles';

-- 3. Verificar o usuário problemático em detalhes técnicos
SELECT 
    id, 
    email, 
    email_confirmed_at, 
    raw_app_meta_data, 
    raw_user_meta_data,
    is_super_admin
FROM auth.users 
WHERE email = 'ia.oliveira.click@gmail.com';

-- 4. Verificar se existe o perfil correspondente
SELECT * FROM public.profiles WHERE email = 'ia.oliveira.click@gmail.com';
