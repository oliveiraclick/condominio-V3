-- 🛡️ RESTORE TRIGGERS & RLS (Bulletproof Fix)

-- 1. Enable RLS on profiles if not active
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop restrictive policies to recreate them correctly
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 3. Create Permissive Policies for Authenticated Users
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- 4. Re-create the Profile Creation Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'resident')
  )
  ON CONFLICT (id) DO NOTHING; -- Avoid errors if client already created it
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Bind the Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Backfill Missing Profiles (Fix for broken users)
INSERT INTO public.profiles (id, email, name, role)
SELECT 
  id, 
  email, 
  raw_user_meta_data->>'full_name',
  COALESCE(raw_user_meta_data->>'role', 'resident')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

SELECT '✅ Sistema de usuários corrigido e perfis recuperados.' as status;
