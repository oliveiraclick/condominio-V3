ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.condominiums ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Residents can view professional profiles" ON public.profiles;
CREATE POLICY "Residents can view professional profiles" 
ON public.profiles FOR SELECT 
USING (role = 'professional');

DROP POLICY IF EXISTS "Authenticated users can view condominiums" ON public.condominiums;
CREATE POLICY "Authenticated users can view condominiums" 
ON public.condominiums FOR SELECT 
TO authenticated
USING (true);

SELECT 'Security policies applied successfully!' as status;
