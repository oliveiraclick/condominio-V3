-- Corrigir default do campo status
ALTER TABLE profiles 
ALTER COLUMN status SET DEFAULT 'active';

-- Verificar
SELECT column_name, column_default 
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'status';
