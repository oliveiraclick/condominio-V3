-- Fix missing foreign key relationships for service_requests
-- This resolves the "could not find a relationship" error in the App

-- 1. Add foreign key for resident_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'service_requests_resident_id_fkey'
    ) THEN
        ALTER TABLE public.service_requests
        ADD CONSTRAINT service_requests_resident_id_fkey
        FOREIGN KEY (resident_id)
        REFERENCES public.profiles(id)
        ON DELETE SET NULL;
    END IF;
END $$;

-- 2. Add foreign key for provider_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'service_requests_provider_id_fkey'
    ) THEN
        ALTER TABLE public.service_requests
        ADD CONSTRAINT service_requests_provider_id_fkey
        FOREIGN KEY (provider_id)
        REFERENCES public.profiles(id)
        ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Reload schema cache (notify PostgREST)
NOTIFY pgrst, 'reload config';
