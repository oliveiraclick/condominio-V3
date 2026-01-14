ALTER TABLE public.packages 
ADD COLUMN IF NOT EXISTS qr_code TEXT UNIQUE;

COMMENT ON COLUMN public.packages.qr_code IS 'Unique QR Code for the package';
