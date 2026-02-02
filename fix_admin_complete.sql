-- DIAGNÓSTICO COMPLETO DO PROBLEMA DE ROLE

-- 1. Verificar TODOS os usuários admin/super_admin
SELECT id, email, name, role, status, created_at
FROM profiles
WHERE role IN ('admin', 'super_admin')
ORDER BY email;

-- 2. Verificar especificamente adm@morador.app
SELECT id, email, name, role, status
FROM profiles
WHERE email = 'adm@morador.app';

-- 3. Verificar se existe algum adm@morador.app com role diferente
SELECT id, email, name, role, status
FROM profiles
WHERE email LIKE '%adm@morador%';

-- 4. CORRIGIR o role do adm@morador.app para admin
UPDATE profiles 
SET role = 'admin'
WHERE email = 'adm@morador.app';

-- 5. Verificar se a correção funcionou
SELECT id, email, name, role, status
FROM profiles
WHERE email = 'adm@morador.app';

-- 6. Listar todos os admins após correção
SELECT email, role
FROM profiles
WHERE role IN ('admin', 'super_admin')
ORDER BY role, email;
