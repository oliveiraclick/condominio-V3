-- Associar todos os usuários ao condomínio existente "Vila Verde Residence"

-- 1. Pegar o ID do condomínio
SELECT id, name FROM public.condominiums;

-- 2. Associar TODOS os usuários a esse condomínio
UPDATE public.profiles
SET condominium_id = 'a9054951-8c24-4f81-926c-518b9af862b6' -- ID do Vila Verde Residence
WHERE condominium_id IS NULL;

-- 3. Verificar se funcionou - deve mostrar o nome do condomínio
SELECT 
  p.id,
  p.name as user_name,
  p.email,
  p.tower,
  p.unit,
  p.condominium_id,
  c.name as condominium_name
FROM public.profiles p
LEFT JOIN public.condominiums c ON p.condominium_id = c.id
LIMIT 10;
