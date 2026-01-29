-- Add missing columns for Package Receipt feature
-- Stores carrier info, batch ID, and tracking timestamps

ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS carrier_name text;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS courier_name text;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS batch_id text;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS original_code text;

-- Optional: create index for batch_id for faster lookups later
CREATE INDEX IF NOT EXISTS idx_packages_batch_id ON public.packages(batch_id);
