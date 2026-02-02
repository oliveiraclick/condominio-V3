-- Add missing columns to common_areas if they don't exist
ALTER TABLE public.common_areas 
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS rules text,
ADD COLUMN IF NOT EXISTS capacity integer;
