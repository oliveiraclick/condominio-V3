-- Create new columns for advanced branding
ALTER TABLE condominiums 
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#06b6d4',
ADD COLUMN IF NOT EXISTS contrast_color TEXT DEFAULT '#ffffff';

COMMENT ON COLUMN condominiums.secondary_color IS 'End color for the primary brand gradient';
COMMENT ON COLUMN condominiums.contrast_color IS 'Text and icon color used on top of brand backgrounds';
