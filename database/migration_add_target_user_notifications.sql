-- Add target_user_id to sent_notifications for direct messaging
ALTER TABLE sent_notifications
ADD COLUMN IF NOT EXISTS target_user_id uuid REFERENCES profiles(id);

-- Update RLS to allow reading if target_user_id matches
DROP POLICY IF EXISTS "Users can read relevant notifications" ON sent_notifications;

CREATE POLICY "Users can read relevant notifications" ON sent_notifications
  FOR SELECT TO authenticated
  USING (
    target_role = 'all' 
    OR target_role = (SELECT role FROM profiles WHERE id = auth.uid())
    OR target_user_id = auth.uid()
  );
