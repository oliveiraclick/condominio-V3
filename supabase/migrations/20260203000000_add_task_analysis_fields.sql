-- Add analysis fields to tasks table safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'needs_quote') THEN
        ALTER TABLE tasks ADD COLUMN needs_quote BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'in_stock') THEN
        ALTER TABLE tasks ADD COLUMN in_stock BOOLEAN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'estimated_cost') THEN
        ALTER TABLE tasks ADD COLUMN estimated_cost NUMERIC(10, 2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'estimated_time') THEN
        ALTER TABLE tasks ADD COLUMN estimated_time TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'analysis_comments') THEN
        ALTER TABLE tasks ADD COLUMN analysis_comments TEXT;
    END IF;
END $$;

-- Update comments to reflect actual status usage in frontend
COMMENT ON COLUMN tasks.status IS 'new | evaluating | executing | finished';
