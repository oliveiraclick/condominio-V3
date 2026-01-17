-- Allow authenticated users (Admins, Professionals, etc) to insert notifications
DROP POLICY IF EXISTS "Users can insert notifications" ON sent_notifications;

CREATE POLICY "Users can insert notifications" ON sent_notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Ensure users can delete their own notifications if needed (or admins can delete any)
DROP POLICY IF EXISTS "Admins can delete notifications" ON sent_notifications;

CREATE POLICY "Admins can delete notifications" ON sent_notifications
  FOR DELETE TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
  );
