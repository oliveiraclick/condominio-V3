-- Verificar EXATAMENTE o que está no banco para adm@morador.app
SELECT 
  id,
  email,
  name,
  role,
  status,
  created_at,
  updated_at
FROM profiles
WHERE email = 'adm@morador.app';

-- Se o role ainda estiver como 'resident', forçar UPDATE
UPDATE profiles 
SET role = 'admin'
WHERE email = 'adm@morador.app'
RETURNING id, email, role;

-- Verificar novamente
SELECT email, role
FROM profiles
WHERE email = 'adm@morador.app';
