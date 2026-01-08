-- Add price column to service_requests for earnings calculation
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS price numeric(10,2) DEFAULT 0.00;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS provider_id uuid references profiles(id);
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS category text; 
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS location text;

-- Ensure RLS allows updating price (usually by professional when completing/accepting)
-- First drop to avoid error if exists
DROP POLICY IF EXISTS "Providers can update price" ON service_requests;

CREATE POLICY "Providers can update price" ON service_requests
FOR UPDATE USING (auth.uid() = provider_id)
WITH CHECK (auth.uid() = provider_id);
