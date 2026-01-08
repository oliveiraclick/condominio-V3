-- Update the user role to super_admin
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'denys@morador.com.br';

-- Ensure checking subscription status doesn't block super admin (optional, handled in code)
UPDATE public.profiles
SET subscription_status = 'active'
WHERE email = 'denys@morador.com.br';
