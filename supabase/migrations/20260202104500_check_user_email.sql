-- Create a function to check if a User exists by email
-- This function is SECURITY DEFINER to bypass RLS, allowing anonymous checks for login error feedback
CREATE OR REPLACE FUNCTION public.check_user_exists_by_email(email_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check in profiles table (assuming profiles are created for every user)
  -- or check in auth.users if possible (but usually not accessible directly via public RPC without high privilege)
  -- For this app's architecture, we check 'profiles'
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE email = email_check
  );
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.check_user_exists_by_email(text) TO anon, authenticated, service_role;
