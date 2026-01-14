-- SCRIPT SEGURO: Apenas define os cargos para usuários que JÁ EXISTEM
-- Crie os usuários no menu Authentication do Supabase e rode este script para dar as permissões.

-- 1. Morador (Se existir email morador@morador.app)
UPDATE public.profiles 
SET role = 'resident', unit = '101', tower = 'A', name = 'Morador Teste'
WHERE email = 'morador@morador.app';

-- 2. Prestador (Se existir email prestador@morador.app)
UPDATE public.profiles 
SET role = 'professional', category = 'Manutenção', name = 'Prestador Teste'
WHERE email = 'prestador@morador.app';

-- 3. Síndico (Se existir email adm@morador.app)
UPDATE public.profiles 
SET role = 'admin', name = 'Síndico Teste'
WHERE email = 'adm@morador.app';

-- 4. Super Admin (Se existir email sadm@morador.app)
UPDATE public.profiles 
SET role = 'super_admin', name = 'Super Admin'
WHERE email = 'sadm@morador.app';
