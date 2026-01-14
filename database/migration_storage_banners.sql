-- Create the 'banners' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public viewing of banners
CREATE POLICY "Public Access to Banners"
ON storage.objects FOR SELECT
USING ( bucket_id = 'banners' );

-- Policy to allow authenticated users (Admins) to upload banners
CREATE POLICY "Admins can upload banners"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'banners' AND auth.role() = 'authenticated' );

-- Policy to allow admins to update/delete banners
CREATE POLICY "Admins can update banners"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'banners' AND auth.role() = 'authenticated' );

CREATE POLICY "Admins can delete banners"
ON storage.objects FOR DELETE
USING ( bucket_id = 'banners' AND auth.role() = 'authenticated' );
