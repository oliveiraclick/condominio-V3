-- Create package_pickup_requests table for remote confirmation
CREATE TABLE IF NOT EXISTS package_pickup_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resident_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  package_ids UUID[] NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '5 minutes'
);

-- Index for faster queries
CREATE INDEX idx_pickup_requests_resident ON package_pickup_requests(resident_id);
CREATE INDEX idx_pickup_requests_status ON package_pickup_requests(status);
CREATE INDEX idx_pickup_requests_created ON package_pickup_requests(created_at DESC);

-- RLS Policies
ALTER TABLE package_pickup_requests ENABLE ROW LEVEL SECURITY;

-- Employees can create and view all requests
CREATE POLICY "Employees can manage pickup requests"
  ON package_pickup_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'employee')
    )
  );

-- Residents can view and update their own requests
CREATE POLICY "Residents can view their pickup requests"
  ON package_pickup_requests
  FOR SELECT
  TO authenticated
  USING (resident_id = auth.uid());

CREATE POLICY "Residents can confirm their pickup requests"
  ON package_pickup_requests
  FOR UPDATE
  TO authenticated
  USING (resident_id = auth.uid())
  WITH CHECK (
    resident_id = auth.uid() 
    AND status = 'pending'
  );

-- Function to auto-expire old requests
CREATE OR REPLACE FUNCTION expire_old_pickup_requests()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE package_pickup_requests
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$;

-- Optional: Create a cron job to run this function periodically
-- This would need to be set up in Supabase dashboard or via pg_cron
