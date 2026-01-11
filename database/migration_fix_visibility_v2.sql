-- Ensure the is_on_site column can be updated by the owner
DO $$ 
BEGIN
    -- Drop existing update policy if any to avoid conflicts
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    
    -- Create a clear update policy
    CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

END $$;

-- Specifically ensure the column exists (it should, but just in case of schema drift)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_on_site BOOLEAN DEFAULT false;
