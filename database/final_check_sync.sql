-- CHECK FINAL: Ver se os dados estão gravando agora
SELECT 
    p.name, 
    p.email, 
    p.role, 
    p.cpf, 
    p.condominium_id,
    p.created_at
FROM public.profiles p
ORDER BY p.created_at DESC
LIMIT 10;

-- Ver se sobrou algum usuário sem perfil
SELECT count(*) as usuarios_sem_perfil 
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;
