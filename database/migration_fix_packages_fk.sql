-- Ensure Foreign Key between packages and profiles exists
-- This fixes potential 'relationship not found' errors in Supabase joins

DO $$
BEGIN
    -- Check if constraint already exists to avoid error
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'packages_resident_id_fkey'
        AND table_name = 'packages'
    ) THEN
        ALTER TABLE "public"."packages"
        ADD CONSTRAINT "packages_resident_id_fkey"
        FOREIGN KEY ("resident_id")
        REFERENCES "public"."profiles" ("id")
        ON DELETE SET NULL;
    END IF;
END $$;
