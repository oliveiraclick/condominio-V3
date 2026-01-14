-- FIXED: Setup Test Users with Correct Schema
-- Assumes category and specialties columns exist now.
-- Assumes is_free exists based on previous success/error messages not complaining about it (or we omit it if unsure, but user image showed it).
-- We will omit is_free if we are not 100% sure, to be safe? 
-- Wait, the user image SHOWED 'is_free'. So we include it.

-- 1. Remove existing test users to ensure clean state
DELETE FROM public.profiles WHERE email IN ('morador@morador.app', 'prestador@morador.app', 'adm@morador.app', 'sadm@morador.app');

-- 2. Insert Test Users
INSERT INTO public.profiles (id, email, name, role, unit, tower, is_free, category)
VALUES 
-- Morador
('00000000-0000-0000-0000-000000000001', 'morador@morador.app', 'Morador Teste', 'resident', '101', 'A', true, NULL),
-- Prestador
('00000000-0000-0000-0000-000000000002', 'prestador@morador.app', 'Prestador Teste', 'professional', NULL, NULL, true, 'Manutenção'),
-- Admin
('00000000-0000-0000-0000-000000000003', 'adm@morador.app', 'Síndico Teste', 'admin', NULL, NULL, true, NULL),
-- Super Admin
('00000000-0000-0000-0000-000000000004', 'sadm@morador.app', 'Super Admin', 'super_admin', NULL, NULL, true, NULL);
