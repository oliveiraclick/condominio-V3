-- Verificar o role específico do adm@morador.app
SELECT id, email, name, role, status
FROM profiles
WHERE email = 'adm@morador.app';

-- Se o role estiver errado, corrigir para admin
UPDATE profiles 
SET role = 'admin'
WHERE email = 'adm@morador.app';

-- Verificar novamente
SELECT id, email, name, role, status
FROM profiles
WHERE email = 'adm@morador.app';
