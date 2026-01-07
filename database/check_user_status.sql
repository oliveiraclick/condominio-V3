-- Verificar o status do usuário recem-criado
SELECT 
    id, 
    email, 
    email_confirmed_at, 
    last_sign_in_at, 
    raw_user_meta_data->>'full_name' as meta_name,
    raw_user_meta_data->>'spouse_name' as meta_spouse,
    raw_user_meta_data->>'role' as role,
    created_at
FROM auth.users
WHERE email = 'denyscoborges@gmail.com'
ORDER BY created_at DESC;

-- Verificar se o perfil correspondente foi criado
SELECT id, name, email, role, spouse_name, condominium_id FROM public.profiles WHERE email = 'denyscoborges@gmail.com';
