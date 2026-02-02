-- PASSO 1: Desabilitar segurança temporariamente para isolar o problema
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- PASSO 2: Verificar se os IDs batem
-- Se user_id for diferente de profile_id, é esse o problema!
SELECT 
    p.id as profile_id, 
    u.id as auth_user_id, 
    p.email as profile_email,
    u.email as auth_email
FROM profiles p
FULL OUTER JOIN auth.users u ON u.email = p.email
WHERE p.email = 'adm@morador.app' OR u.email = 'adm@morador.app';
