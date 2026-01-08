-- Create login_history table
CREATE TABLE IF NOT EXISTS login_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT,
  condo_id UUID REFERENCES condominiums(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can insert their own login record
CREATE POLICY "Users can insert own login history" ON login_history
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Super Admin can view all login history
CREATE POLICY "Super Admin can view all login history" ON login_history
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Create index for faster queries on stats
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_created_at ON login_history(created_at);
