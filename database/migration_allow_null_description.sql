-- Allow description to be null (optional at receipt stage)
ALTER TABLE public.packages ALTER COLUMN description DROP NOT NULL;
