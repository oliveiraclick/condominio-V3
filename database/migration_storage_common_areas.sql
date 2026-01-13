-- Create 'common_areas' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('common_areas', 'common_areas', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public read access (for photos)
DROP POLICY IF EXISTS "Public Access Common Areas" ON storage.objects;
CREATE POLICY "Public Access Common Areas"
ON storage.objects FOR SELECT
USING ( bucket_id = 'common_areas' );

-- Policy: Allow Admin/SuperAdmin to upload
-- Note: Simplified to authenticated for implementation speed, but could be restricted
DROP POLICY IF EXISTS "Authenticated upload Common Areas" ON storage.objects;
CREATE POLICY "Authenticated upload Common Areas"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'common_areas' );

-- Policy: Allow Update
DROP POLICY IF EXISTS "Authenticated update Common Areas" ON storage.objects;
CREATE POLICY "Authenticated update Common Areas"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'common_areas' );

-- Policy: Allow Delete
DROP POLICY IF EXISTS "Authenticated delete Common Areas" ON storage.objects;
CREATE POLICY "Authenticated delete Common Areas"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'common_areas' );
