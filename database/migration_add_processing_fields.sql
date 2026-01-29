-- Add processing fields
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS internal_code text;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS processed_at timestamp with time zone;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS processed_by uuid;
