-- FIXED: Generating valid UUIDs for test users
-- We use a known UUID seed or gen_random_uuid() to satisfy the UUID type constraint.

-- 1. Morador
INSERT INTO public.profiles (id, email, name, role, unit, tower, is_free)
VALUES 
('00000000-0000-0000-0000-000000000001', 'morador@morador.app', 'Morador Teste', 'resident', '101', 'A', true)
ON CONFLICT (email) DO UPDATE SET 
role = 'resident', name = 'Morador Teste', unit = '101', tower = 'A';

-- 2. Prestador
INSERT INTO public.profiles (id, email, name, role, category, is_free)
VALUES 
('00000000-0000-0000-0000-000000000002', 'prestador@morador.app', 'Prestador Teste', 'professional', 'Manutenção', true)
ON CONFLICT (email) DO UPDATE SET 
role = 'professional', name = 'Prestador Teste', category = 'Manutenção';

-- 3. Admin (Síndico)
INSERT INTO public.profiles (id, email, name, role, is_free)
VALUES 
('00000000-0000-0000-0000-000000000003', 'adm@morador.app', 'Síndico Teste', 'admin', true)
ON CONFLICT (email) DO UPDATE SET 
role = 'admin', name = 'Síndico Teste';

-- 4. Super Admin
INSERT INTO public.profiles (id, email, name, role, is_free)
VALUES 
('00000000-0000-0000-0000-000000000004', 'sadm@morador.app', 'Super Admin', 'super_admin', true)
ON CONFLICT (email) DO UPDATE SET 
role = 'super_admin', name = 'Super Admin';
