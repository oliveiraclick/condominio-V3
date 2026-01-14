ALTER TABLE public.packages 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

COMMENT ON COLUMN public.packages.photo_url IS 'URL of the package photo evidence';
