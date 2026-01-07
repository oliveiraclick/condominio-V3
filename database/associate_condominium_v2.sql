-- Associar usuários ao condomínio usando o ID correto dinamicamente

-- 1. Ver qual condomínio existe (copie o ID que aparecer)
SELECT id, name, address FROM public.condominiums;

-- 2. Associar TODOS os usuários ao PRIMEIRO condomínio encontrado
UPDATE public.profiles
SET condominium_id = (SELECT id FROM public.condominiums LIMIT 1)
WHERE condominium_id IS NULL;

-- 3. Verificar se funcionou
SELECT 
  p.name as user_name,
  p.email,
  c.name as condominium_name
FROM public.profiles p
LEFT JOIN public.condominiums c ON p.condominium_id = c.id
LIMIT 10;
