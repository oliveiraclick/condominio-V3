-- Add new columns to packages table for the new 3-step flow
ALTER TABLE public.packages
ADD COLUMN IF NOT EXISTS carrier_name text,
ADD COLUMN IF NOT EXISTS courier_name text,
ADD COLUMN IF NOT EXISTS original_code text,
ADD COLUMN IF NOT EXISTS internal_code text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS pickup_code text,
ADD COLUMN IF NOT EXISTS confirmed_by_resident_at timestamptz,
ADD COLUMN IF NOT EXISTS batch_id uuid DEFAULT gen_random_uuid();

-- Create index for faster lookups on codes
CREATE INDEX IF NOT EXISTS packages_original_code_idx ON public.packages(original_code);
CREATE INDEX IF NOT EXISTS packages_internal_code_idx ON public.packages(internal_code);
CREATE INDEX IF NOT EXISTS packages_batch_id_idx ON public.packages(batch_id);

-- Update RLS policies if necessary (Authorized Admins/Concierge)
-- Assuming existing policies cover 'insert' for authenticated staff.
