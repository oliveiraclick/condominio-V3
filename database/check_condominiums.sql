-- 1. Ver a estrutura da tabela condominiums
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'condominiums' 
AND table_schema = 'public';

-- 2. Ver se já existe algum condomínio
SELECT * FROM public.condominiums;
