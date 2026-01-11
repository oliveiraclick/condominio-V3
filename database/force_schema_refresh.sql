-- SAFE FIX FOR SCHEMA CACHE & MISSING COLUMN

DO $$
BEGIN
    -- 1. Check if column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'condominium_id') THEN
        ALTER TABLE profiles ADD COLUMN condominium_id UUID REFERENCES condominiums(id);
    END IF;
END $$;

-- 2. Force PostgREST to reload the schema cache
-- This is critical when columns are added but the API doesn't see them yet
NOTIFY pgrst, 'reload schema';
