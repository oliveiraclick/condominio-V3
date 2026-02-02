-- Create a function to check if a CNPJ already exists
CREATE OR REPLACE FUNCTION public.check_duplicate_cnpj(cnpj_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE cnpj = cnpj_check
  );
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.check_duplicate_cnpj(text) TO anon, authenticated, service_role;
