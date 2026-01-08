-- Add status column if it doesn't exist
ALTER TABLE condominiums ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Allow authenticated users to update the status (RLS was already covered for UPDATE/DELETE generally, but ensuring no column-specific blocks)
-- (The previous robust RLS script covers this)
