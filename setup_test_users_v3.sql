-- FIXED: Handling potential duplicate emails without ON CONFLICT (email)
-- Since 'email' might not be a unique key, we first delete any existing test profiles to avoid duplicates,
-- then insert fresh ones.

-- 1. Remove existing test users to ensure clean state
DELETE FROM public.profiles WHERE email IN ('morador@morador.app', 'prestador@morador.app', 'adm@morador.app', 'sadm@morador.app');

-- 2. Insert Test Users
INSERT INTO public.profiles (id, email, name, role, unit, tower, is_free, category)
VALUES 
('00000000-0000-0000-0000-000000000001', 'morador@morador.app', 'Morador Teste', 'resident', '101', 'A', true, NULL),
('00000000-0000-0000-0000-000000000002', 'prestador@morador.app', 'Prestador Teste', 'professional', NULL, NULL, true, 'Manutenção'),
('00000000-0000-0000-0000-000000000003', 'adm@morador.app', 'Síndico Teste', 'admin', NULL, NULL, true, NULL),
('00000000-0000-0000-0000-000000000004', 'sadm@morador.app', 'Super Admin', 'super_admin', NULL, NULL, true, NULL);
