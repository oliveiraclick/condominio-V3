-- ADD DESCRIPTION COLUMN TO PROFILES
-- This fixes the error "Could not find the 'description' column of 'profiles'"

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS description TEXT;

-- Verify
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'description') THEN
        RAISE NOTICE '✅ Coluna DESCRIPTION adicionada com sucesso!';
    ELSE
        RAISE EXCEPTION '❌ Falha ao adicionar coluna description';
    END IF;
END $$;
