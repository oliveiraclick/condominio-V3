-- Create test users in auth.users (if possible via SQL, otherwise profiles only)
-- Note: Direct insertion into auth.users is restricted in some environments, but we'll try to set up the profiles.
-- The user will need to sign up these users manually or we rely on them already existing/being created on first login if the auth trigger handles it.
-- However, for a cohesive test environment, we will UPSERT into public.profiles to ensure roles are correct when they do log in.

-- 1. Morador
INSERT INTO public.profiles (id, email, name, role, unit, tower, condominium_id)
VALUES 
('test-user-morador', 'morador@morador.app', 'Morador Teste', 'resident', '101', 'A', NULL)
ON CONFLICT (email) DO UPDATE SET 
role = 'resident', name = 'Morador Teste', unit = '101', tower = 'A';

-- 2. Prestador
INSERT INTO public.profiles (id, email, name, role, category)
VALUES 
('test-user-prestador', 'prestador@morador.app', 'Prestador Teste', 'professional', 'Manutenção')
ON CONFLICT (email) DO UPDATE SET 
role = 'professional', name = 'Prestador Teste', category = 'Manutenção';

-- 3. Admin (Síndico)
INSERT INTO public.profiles (id, email, name, role, condominium_id)
VALUES 
('test-user-adm', 'adm@morador.app', 'Síndico Teste', 'admin', NULL)
ON CONFLICT (email) DO UPDATE SET 
role = 'admin', name = 'Síndico Teste';

-- 4. Super Admin
INSERT INTO public.profiles (id, email, name, role)
VALUES 
('test-user-sadm', 'sadm@morador.app', 'Super Admin', 'super_admin')
ON CONFLICT (email) DO UPDATE SET 
role = 'super_admin', name = 'Super Admin';

-- Note: Actual authentication (password 102030) is handled by Supabase Auth. 
-- You must Create these users in the Supabase Auth dashboard or via Sign Up in the app with this password.
