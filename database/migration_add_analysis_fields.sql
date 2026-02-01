-- Migration to add analysis and deadline fields to tasks table
-- Created: 2026-01-31

ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS analysis_comments TEXT,
ADD COLUMN IF NOT EXISTS needs_quote BOOLEAN,
ADD COLUMN IF NOT EXISTS in_stock BOOLEAN,
ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS estimated_time TEXT;

-- Comment on columns
COMMENT ON COLUMN tasks.analysis_comments IS 'Comments from the employee analysis phase';
COMMENT ON COLUMN tasks.needs_quote IS 'If the task requires external quote';
COMMENT ON COLUMN tasks.in_stock IS 'If materials are available in stock';
COMMENT ON COLUMN tasks.estimated_cost IS 'Estimated cost for the task';
COMMENT ON COLUMN tasks.estimated_time IS 'Estimated time to complete';
