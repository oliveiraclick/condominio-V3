-- Create a function to check if a CPF already exists
-- This function is SECURITY DEFINER to bypass RLS, allowing anonymous checks
CREATE OR REPLACE FUNCTION public.check_duplicate_cpf(cpf_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE cpf = cpf_check
  );
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.check_duplicate_cpf(text) TO anon, authenticated, service_role;
