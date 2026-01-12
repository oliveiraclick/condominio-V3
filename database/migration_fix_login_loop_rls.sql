-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop potentially conflicting policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- 1. VIEW: Allow users to view their own profile (Critical for Login)
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- 2. VIEW: Also allow viewing 'professional' profiles (Required for search/mural)
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true); 
-- Note: 'true' is broad but safe for this app's "Social" nature. 
-- If strict privacy is needed, we can restrict to role='professional' OR auth.uid()=id.

-- 3. UPDATE: Allow users to update their own profile (Avatar, Name, etc)
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- 4. INSERT: Allow users to insert their own profile (Registration)
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 5. FUNCTION: Fix Profile Views increment permissions if needed
GRANT EXECUTE ON FUNCTION increment_profile_view TO authenticated;
