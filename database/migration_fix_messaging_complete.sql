-- 1. Add Column (Safe Check)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sent_notifications' AND column_name = 'target_user_id') THEN
        ALTER TABLE sent_notifications ADD COLUMN target_user_id uuid REFERENCES profiles(id);
    END IF;
END $$;

-- 2. Drop View (To allow dependency changes if needed)
DROP VIEW IF EXISTS my_unread_notifications;

-- 3. Update Policy (Safe Drop/Create)
DROP POLICY IF EXISTS "Users can read relevant notifications" ON sent_notifications;

CREATE POLICY "Users can read relevant notifications" ON sent_notifications
  FOR SELECT TO authenticated
  USING (
    target_role = 'all' 
    OR target_role = (SELECT role FROM profiles WHERE id = auth.uid())
    OR target_user_id = auth.uid()
  );

-- 4. Re-Define View
CREATE OR REPLACE VIEW my_unread_notifications AS
SELECT
  n.id,
  n.title,
  n.body,
  n.target_role,
  n.created_at,
  n.created_by,
  n.condominium_id,
  n.target_user_id
FROM sent_notifications n
WHERE
  (
    n.target_user_id = auth.uid() -- Direct message priority
    OR
    (
      (n.target_role = 'all' OR n.target_role = (SELECT role FROM profiles WHERE id = auth.uid()))
      AND
      (n.target_user_id IS NULL) -- Only apply role/condo filter if not a direct message
    )
  )
  AND
  (
    n.condominium_id IS NULL 
    OR n.condominium_id = (SELECT condominium_id FROM profiles WHERE id = auth.uid())
    OR n.target_user_id = auth.uid() -- Bypass condo check if direct message
  )
  AND
  NOT EXISTS (
    SELECT 1 FROM notification_reads nr
    WHERE nr.notification_id = n.id
    AND nr.user_id = auth.uid()
  );

GRANT SELECT ON my_unread_notifications TO authenticated;
