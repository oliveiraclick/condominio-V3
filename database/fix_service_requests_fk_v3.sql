-- Fix Service Requests: Allow NULL resident_id and fix FKs
-- This resolves the "null value in column resident_id violates not-null constraint" error

-- 1. Remove NOT NULL constraint from resident_id to allow "orphan" requests (orphans are better than deletion)
ALTER TABLE public.service_requests
ALTER COLUMN resident_id DROP NOT NULL;

-- 2. Clean up invalid provider_ids (Set to NULL if profile doesn't exist)
UPDATE public.service_requests
SET provider_id = NULL
WHERE provider_id IS NOT NULL 
AND provider_id NOT IN (SELECT id FROM public.profiles);

-- 3. Clean up invalid resident_ids (Set to NULL if profile doesn't exist)
UPDATE public.service_requests
SET resident_id = NULL
WHERE resident_id IS NOT NULL 
AND resident_id NOT IN (SELECT id FROM public.profiles);

-- 4. Add foreign key for resident_id if it doesn't exist
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

-- 5. Add foreign key for provider_id if it doesn't exist
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

-- 6. Reload schema cache
NOTIFY pgrst, 'reload config';
