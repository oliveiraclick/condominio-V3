-- FIX PROFILE UPDATE POLICY
-- This script explicitly allows authenticated users to update their own profile rows.

-- 1. Create (or replace) the UPDATE policy
DO $$
BEGIN
    -- Check if policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" 
        ON public.profiles 
        FOR UPDATE 
        USING (auth.uid() = id);
    END IF;
END $$;

-- 2. Ensure Grant Permissions
GRANT UPDATE ON public.profiles TO authenticated;

-- 3. Verify (Optional log)
DO $$
BEGIN
    RAISE NOTICE '✅ Policy "Users can update own profile" ensured.';
END $$;
