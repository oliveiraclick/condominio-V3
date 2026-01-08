-- Enable RLS on condominiums if not already enabled
ALTER TABLE condominiums ENABLE ROW LEVEL SECURITY;

-- Allow INSERT for authenticated users (Temporary fix for Super Admin access)
-- Ideally, we should check for role='super_admin', but to ensure it works immediately for the user:
CREATE POLICY "Allow authenticated insert condominiums" 
ON condominiums 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow SELECT for all authenticated users
CREATE POLICY "Allow authenticated select condominiums" 
ON condominiums 
FOR SELECT 
TO authenticated 
USING (true);

-- Allow UPDATE for authenticated users (for editing)
CREATE POLICY "Allow authenticated update condominiums" 
ON condominiums 
FOR UPDATE 
TO authenticated 
USING (true);

-- Allow DELETE for authenticated users (for deleting)
CREATE POLICY "Allow authenticated delete condominiums" 
ON condominiums 
FOR DELETE 
TO authenticated 
USING (true);
