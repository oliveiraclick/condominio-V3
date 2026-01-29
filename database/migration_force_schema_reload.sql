-- Force PostgREST schema cache reload
-- This is necessary when adding columns if the API doesn't detect them automatically

NOTIFY pgrst, 'reload schema';

-- Also ensure columns exist just in case
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS batch_id text;
