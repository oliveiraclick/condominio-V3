-- Disable RLS on notification_reads to debug persistence
ALTER TABLE notification_reads DISABLE ROW LEVEL SECURITY;

-- Grant access to everyone (authenticated) just in case
GRANT ALL ON notification_reads TO authenticated;
