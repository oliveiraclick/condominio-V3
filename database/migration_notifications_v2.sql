-- Notifications Table (Robust Script)
CREATE TABLE IF NOT EXISTS sent_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  body text NOT NULL,
  target_role text DEFAULT 'all', -- 'all', 'resident', 'professional', 'sysadmin'
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sent_notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid errors
DROP POLICY IF EXISTS "Super Admin can send notifications" ON sent_notifications;
DROP POLICY IF EXISTS "Super Admin can view all notifications" ON sent_notifications;
DROP POLICY IF EXISTS "Users can read relevant notifications" ON sent_notifications;

-- Re-create policies
CREATE POLICY "Super Admin can send notifications" ON sent_notifications
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin');

CREATE POLICY "Super Admin can view all notifications" ON sent_notifications
  FOR SELECT TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin');

CREATE POLICY "Users can read relevant notifications" ON sent_notifications
  FOR SELECT TO authenticated
  USING (
    target_role = 'all' 
    OR target_role = (SELECT role FROM profiles WHERE id = auth.uid())
  );
