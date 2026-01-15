-- Add reviewed column to service_requests
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS reviewed BOOLEAN DEFAULT FALSE;

-- Update RLS policies to allow residents to mark as reviewed
CREATE POLICY "Residents can update reviewed status" ON service_requests
    FOR UPDATE USING (auth.uid() = resident_id)
    WITH CHECK (auth.uid() = resident_id);
