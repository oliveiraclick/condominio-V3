-- 1. Verificar se existe a tabela condominiums
SELECT * FROM public.condominiums LIMIT 5;

-- 2. Se estiver vazia, criar um condomínio padrão
INSERT INTO public.condominiums (name, address, units_count, created_at)
VALUES ('Splendido Residencial', 'Rua Exemplo, 123', 100, NOW())
ON CONFLICT DO NOTHING
RETURNING id, name;

-- 3. Associar TODOS os usuários ao condomínio criado
UPDATE public.profiles
SET condominium_id = (SELECT id FROM public.condominiums ORDER BY created_at DESC LIMIT 1)
WHERE condominium_id IS NULL;

-- 4. Verificar se funcionou
SELECT 
  p.id,
  p.name,
  p.email,
  p.tower,
  p.unit,
  c.name as condominium_name
FROM public.profiles p
LEFT JOIN public.condominiums c ON p.condominium_id = c.id
WHERE p.email = 'denyscoborges@gmail.com'; -- Seu email aqui
