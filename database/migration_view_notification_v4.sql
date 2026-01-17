-- Update View to Include Direct Messages (target_user_id)
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
      (n.target_user_id IS NULL) -- Only apply role/condo filter if not a direct message? Or redundant? 
      -- Logic: If target_user_id is set, it's for that user ONLY. If null, use role logic.
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
