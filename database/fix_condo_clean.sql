SELECT id, name, address FROM public.condominiums;

UPDATE public.profiles
SET condominium_id = (SELECT id FROM public.condominiums LIMIT 1)
WHERE condominium_id IS NULL;

SELECT 
  p.name as user_name,
  p.email,
  c.name as condominium_name
FROM public.profiles p
LEFT JOIN public.condominiums c ON p.condominium_id = c.id
LIMIT 10;
