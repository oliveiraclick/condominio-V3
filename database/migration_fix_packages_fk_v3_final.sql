/* 
  V3 FINAL FIX: Standardize Foreign Key for Packages
  1. Drops all potential variations of the FK to ensure a clean slate.
  2. Re-creates the standard "packages_resident_id_fkey".
*/

DO $$
BEGIN
    -- Drop V1 name if exists
    BEGIN
        ALTER TABLE "public"."packages" DROP CONSTRAINT "packages_resident_id_fkey";
    EXCEPTION
        WHEN undefined_object THEN NULL;
    END;

    -- Drop V2 name if exists
    BEGIN
        ALTER TABLE "public"."packages" DROP CONSTRAINT "packages_resident_profile_fkey";
    EXCEPTION
        WHEN undefined_object THEN NULL;
    END;

    -- Create the STANDARD V1 Foreign Key
    ALTER TABLE "public"."packages"
    ADD CONSTRAINT "packages_resident_id_fkey"
    FOREIGN KEY ("resident_id")
    REFERENCES "public"."profiles" ("id")
    ON DELETE SET NULL;

END $$;
