CREATE TABLE IF NOT EXISTS public.condominiums (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  address text,
  plan text DEFAULT 'basic',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS condominium_id uuid REFERENCES public.condominiums(id);

ALTER TABLE public.condominiums ENABLE ROW LEVEL SECURITY;

INSERT INTO public.condominiums (name, address, plan)
SELECT 'Vila Verde Residence', 'Rua das Flores, 123', 'pro'
WHERE NOT EXISTS (SELECT 1 FROM public.condominiums);

UPDATE public.profiles 
SET condominium_id = (SELECT id FROM public.condominiums LIMIT 1) 
WHERE condominium_id IS NULL;
