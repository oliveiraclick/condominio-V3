-- Add Branding Columns to Condominiums table
ALTER TABLE condominiums 
ADD COLUMN IF NOT EXISTS primary_color VARCHAR(7) DEFAULT '#7c3aed',
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Create Storage Bucket for Condo Assets (Logos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('condo_assets', 'condo_assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policies (Drop first to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can upload condo assets" ON storage.objects;
CREATE POLICY "Authenticated users can upload condo assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'condo_assets');

DROP POLICY IF EXISTS "Public can view condo assets" ON storage.objects;
CREATE POLICY "Public can view condo assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'condo_assets');

DROP POLICY IF EXISTS "Authenticated users can update condo assets" ON storage.objects;
CREATE POLICY "Authenticated users can update condo assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'condo_assets');

DROP POLICY IF EXISTS "Authenticated users can delete condo assets" ON storage.objects;
CREATE POLICY "Authenticated users can delete condo assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'condo_assets');
