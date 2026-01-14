DO $$
BEGIN
    ALTER TABLE "public"."packages" DROP CONSTRAINT IF EXISTS "packages_resident_id_fkey";
    
    ALTER TABLE "public"."packages" DROP CONSTRAINT IF EXISTS "packages_resident_profile_fkey";

    ALTER TABLE "public"."packages"
    ADD CONSTRAINT "packages_resident_profile_fkey"
    FOREIGN KEY ("resident_id")
    REFERENCES "public"."profiles" ("id")
    ON DELETE SET NULL;
END $$;
