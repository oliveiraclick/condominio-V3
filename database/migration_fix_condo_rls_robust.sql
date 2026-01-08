-- 1. Enable RLS (Safe to run multiple times)
ALTER TABLE condominiums ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid "Already Exists" errors
DROP POLICY IF EXISTS "Allow authenticated insert condominiums" ON condominiums;
DROP POLICY IF EXISTS "Allow authenticated select condominiums" ON condominiums;
DROP POLICY IF EXISTS "Allow authenticated update condominiums" ON condominiums;
DROP POLICY IF EXISTS "Allow authenticated delete condominiums" ON condominiums;

-- 3. Re-create policies (Covers Create, Read, Update, Delete)
CREATE POLICY "Allow authenticated insert condominiums" 
ON condominiums FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated select condominiums" 
ON condominiums FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated update condominiums" 
ON condominiums FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete condominiums" 
ON condominiums FOR DELETE TO authenticated USING (true);
