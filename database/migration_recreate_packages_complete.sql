-- 1. Create Table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.packages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    unit text,
    resident_id uuid,
    resident_name text,
    description text,
    photo_url text,
    qr_code text UNIQUE,
    status text DEFAULT 'pending',
    picked_up_at timestamp with time zone,
    picked_up_by uuid,
    receiver_phone text
);

-- 2. Add columns if they are missing (Safe update)
DO $$
BEGIN
    ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS resident_name text;
    ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS photo_url text;
    ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS qr_code text;
    ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS picked_up_at timestamp with time zone;
    ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS picked_up_by uuid;
EXCEPTION
    WHEN undefined_table THEN NULL; 
END $$;

-- 3. Fix Foreign Keys (Standard Name: packages_resident_id_fkey)
DO $$
BEGIN
    -- Remove conflicting keys
    BEGIN ALTER TABLE public.packages DROP CONSTRAINT "packages_resident_profile_fkey"; EXCEPTION WHEN undefined_object THEN NULL; END;
    BEGIN ALTER TABLE public.packages DROP CONSTRAINT "packages_resident_id_fkey"; EXCEPTION WHEN undefined_object THEN NULL; END;

    -- Add the correct clean key
    ALTER TABLE public.packages
    ADD CONSTRAINT "packages_resident_id_fkey"
    FOREIGN KEY (resident_id)
    REFERENCES public.profiles (id)
    ON DELETE SET NULL;
    
    -- Picked Up By FK
    BEGIN ALTER TABLE public.packages DROP CONSTRAINT "packages_picked_up_by_fkey"; EXCEPTION WHEN undefined_object THEN NULL; END;
    
    ALTER TABLE public.packages
    ADD CONSTRAINT "packages_picked_up_by_fkey"
    FOREIGN KEY (picked_up_by)
    REFERENCES public.profiles (id)
    ON DELETE SET NULL;

END $$;

-- 4. Enable RLS
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- 5. Standard Policy (Admins/Porteiro View All)
DROP POLICY IF EXISTS "Admins view all" ON public.packages;
CREATE POLICY "Admins view all" ON public.packages
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin', 'porteiro')
    )
);

-- 6. Residents View Own
DROP POLICY IF EXISTS "Residents view own" ON public.packages;
CREATE POLICY "Residents view own" ON public.packages
FOR SELECT USING (
    resident_id = auth.uid() OR picked_up_by = auth.uid()
);

-- 7. Residents Confirm Own (Handshake)
DROP POLICY IF EXISTS "Residents update own" ON public.packages;
CREATE POLICY "Residents update own" ON public.packages
FOR UPDATE USING (
    resident_id = auth.uid()
) WITH CHECK (
    resident_id = auth.uid()
);
