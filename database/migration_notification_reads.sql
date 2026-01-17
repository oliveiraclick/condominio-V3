CREATE TABLE IF NOT EXISTS notification_reads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id uuid REFERENCES sent_notifications(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  read_at timestamptz DEFAULT now(),
  UNIQUE(notification_id, user_id)
);

ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;

-- Policies for notification_reads
CREATE POLICY "Users can insert their own reads" ON notification_reads
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reads" ON notification_reads
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
