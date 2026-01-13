-- Create Common Areas Table
CREATE TABLE IF NOT EXISTS common_areas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  capacity integer,
  price numeric DEFAULT 0,
  hours text, -- e.g. "08:00 - 22:00"
  rules text,
  photos text[],
  inventory text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE common_areas ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public read access" ON common_areas;
CREATE POLICY "Public read access" ON common_areas
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write access" ON common_areas;
CREATE POLICY "Admin write access" ON common_areas
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
  );
