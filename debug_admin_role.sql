-- Verificar o role do usuário admin
SELECT 
  id,
  email,
  name,
  role,
  status,
  created_at
FROM profiles
WHERE email = 'adm@morador.app';

-- Verificar todos os admins
SELECT 
  id,
  email,
  name,
  role
FROM profiles
WHERE role IN ('admin', 'super_admin')
ORDER BY email;
