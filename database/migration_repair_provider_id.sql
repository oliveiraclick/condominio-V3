-- Fix for 'provider_id' column missing error
-- Run this in your Supabase SQL Editor

-- 1. Ensure provider_id exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'provider_id') THEN
        ALTER TABLE service_requests ADD COLUMN provider_id uuid references profiles(id);
    END IF;
END $$;

-- 2. If 'professional_id' exists (legacy), copy data to 'provider_id'
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'professional_id') THEN
        -- Move data
        UPDATE service_requests SET provider_id = professional_id WHERE provider_id IS NULL;
        -- Optional: Drop legacy column
        -- ALTER TABLE service_requests DROP COLUMN professional_id;
    END IF;
END $$;

-- 3. Ensure RLS Policy uses provider_id
DROP POLICY IF EXISTS "Providers can see requests assigned to them or open" ON service_requests;
CREATE POLICY "Providers can see requests assigned to them or open" 
ON service_requests FOR SELECT 
USING ( 
  auth.uid() = provider_id OR status = 'pending'
);

DROP POLICY IF EXISTS "Providers can update assigned requests" ON service_requests;
CREATE POLICY "Providers can update assigned requests" 
ON service_requests FOR UPDATE 
USING ( auth.uid() = provider_id );
