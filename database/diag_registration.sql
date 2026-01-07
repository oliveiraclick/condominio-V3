-- 1. Ver quais colunas existem na tabela profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- 2. Verificar se o trigger existe
SELECT trigger_name, event_manipulation, action_statement, action_timing
FROM information_schema.triggers
WHERE event_object_table = 'users' AND event_object_schema = 'auth';

-- 3. Verificar usuários recentes e se eles têm perfil
SELECT 
    au.id, 
    au.email, 
    au.raw_user_meta_data->>'role' as meta_role,
    p.id as profile_id,
    p.role as profile_role
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC
LIMIT 5;
