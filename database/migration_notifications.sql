-- Notifications Table for Global/Targeted In-App Messaging
CREATE TABLE IF NOT EXISTS sent_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  body text NOT NULL,
  target_role text DEFAULT 'all', -- 'all', 'resident', 'professional', 'sysadmin'
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sent_notifications ENABLE ROW LEVEL SECURITY;

-- Super Admins can insert (send) notifications
-- Admins (Super and Condo) can insert (send) notifications
DROP POLICY IF EXISTS "Super Admin can send notifications" ON sent_notifications;
DROP POLICY IF EXISTS "Admins can send notifications" ON sent_notifications;

CREATE POLICY "Admins can send notifications" ON sent_notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

-- Everyone can read notifications that target them or 'all'
CREATE POLICY "Users can read relevant notifications" ON sent_notifications
  FOR SELECT TO authenticated
  USING (
    target_role = 'all' 
    OR target_role = (SELECT role FROM profiles WHERE id = auth.uid())
  );
