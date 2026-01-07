-- Corrigir dados do perfil do usuário logado
-- Substitua o ID pelo ID do usuário que você está usando

-- 1. Ver qual usuário está com problema
SELECT id, email, name, spouse_name, tower, unit 
FROM public.profiles 
WHERE email = 'denyscoborges@gmail.com'; -- Coloque seu email aqui

-- 2. Atualizar os dados corretos (AJUSTE OS VALORES CONFORME NECESSÁRIO)
UPDATE public.profiles
SET 
  name = 'Denys Coborges',  -- SEU NOME AQUI
  spouse_name = 'Simone',   -- Nome do cônjuge
  tower = 'A',              -- Sua torre
  unit = '101',             -- Sua unidade
  condominium_id = (SELECT id FROM public.condominiums LIMIT 1) -- Associar ao primeiro condomínio
WHERE email = 'denyscoborges@gmail.com'; -- SEU EMAIL AQUI

-- 3. Verificar se atualizou
SELECT id, email, name, spouse_name, tower, unit, condominium_id
FROM public.profiles 
WHERE email = 'denyscoborges@gmail.com';
