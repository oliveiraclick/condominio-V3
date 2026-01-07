-- Verificar se algum usuário foi criado HOJE
SELECT 
    id, 
    email, 
    created_at, 
    raw_user_meta_data->>'role' as role,
    raw_user_meta_data->>'full_name' as name
FROM auth.users
WHERE created_at > CURRENT_DATE
ORDER BY created_at DESC;

-- Verificar logs de erro recentes (se houver extensão de log ou similar)
-- Se não, ver os perfis criados hoje
SELECT * FROM public.profiles WHERE created_at > CURRENT_DATE;
