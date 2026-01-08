-- Allow authenticated users to view all profiles (needed to see Professional names/avatars)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING ( true );

-- Ensure Professional Services are viewable
DROP POLICY IF EXISTS "Public services viewable by everyone" ON professional_services;
CREATE POLICY "Public services viewable by everyone" 
ON professional_services FOR SELECT 
USING ( true );

-- Ensure Products are viewable
DROP POLICY IF EXISTS "Public products viewable by everyone" ON products;
CREATE POLICY "Public products viewable by everyone" 
ON products FOR SELECT 
USING ( true );
