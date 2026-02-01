-- Drop existing tasks tables if they exist
-- Run this BEFORE running the main migration

DROP TABLE IF EXISTS task_attachments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_tasks_updated_at() CASCADE;
