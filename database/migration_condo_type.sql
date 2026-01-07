-- Add 'type' column to condominiums table
ALTER TABLE condominiums 
ADD COLUMN type text DEFAULT 'vertical';

-- Update existing condominiums with specific types
-- Assuming IDs or Names context. Since I don't have IDs guaranteed, I'll update by name if possible or just rely on default.
-- 'Vila Verde Residence' -> Vertical
-- 'Splendido Residencial' -> Vertical
-- 'Grand Park' -> Horizontal (Condomínio de Casas)

UPDATE condominiums SET type = 'horizontal' WHERE name LIKE '%Grand Park%';
UPDATE condominiums SET type = 'vertical' WHERE name LIKE '%Splendido%';
UPDATE condominiums SET type = 'vertical' WHERE name LIKE '%Vila Verde%';

-- Policy update not strictly needed as it's a structural change, but ensuring RLS is fine.
-- (No new policies needed just for a column if generic select * is used)
