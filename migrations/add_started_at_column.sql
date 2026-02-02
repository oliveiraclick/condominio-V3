-- Add started_at column to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE NULL;

-- Comment on column
COMMENT ON COLUMN tasks.started_at IS 'Timestamp when the task execution started';
