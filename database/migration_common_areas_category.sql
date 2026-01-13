-- Add category column to common_areas
ALTER TABLE common_areas 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'Gourmet';

-- Update existing records based on keywords (heuristic)
UPDATE common_areas 
SET category = 'Esportes' 
WHERE name ILIKE '%quadra%' OR name ILIKE '%campo%' OR name ILIKE '%piscina%' OR name ILIKE '%ginásio%';

-- Default everything else to Gourmet for now (Salão, Churrasqueira usually fall here)
UPDATE common_areas 
SET category = 'Gourmet' 
WHERE category IS NULL;
