-- Add resident_name column
ALTER TABLE public.packages 
ADD COLUMN IF NOT EXISTS resident_name TEXT;

-- Add receiver_phone column (just in case)
ALTER TABLE public.packages 
ADD COLUMN IF NOT EXISTS receiver_phone TEXT;

-- Add tower column (Admin.tsx uses it)
ALTER TABLE public.packages 
ADD COLUMN IF NOT EXISTS tower TEXT;

COMMENT ON COLUMN public.packages.resident_name IS 'Name of the resident (cached for display)';
