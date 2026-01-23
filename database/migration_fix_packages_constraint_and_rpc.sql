-- Migration: Fix Packages Status Constraint and Pickup RPC (Corrected)
-- Date: 2026-01-23

-- 1. Fix 'packages_status_check' constraint
BEGIN;
ALTER TABLE public.packages DROP CONSTRAINT IF EXISTS packages_status_check;
ALTER TABLE public.packages ADD CONSTRAINT packages_status_check CHECK (status IN ('pending', 'delivered', 'returned', 'waiting_pickup'));
COMMIT;

-- 2. Ensure package_authorizations exists
CREATE TABLE IF NOT EXISTS public.package_authorizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    grantor_id UUID REFERENCES public.profiles(id) NOT NULL,
    grantee_id UUID REFERENCES public.profiles(id) NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.package_authorizations ENABLE ROW LEVEL SECURITY;

-- 3. Safely recreate policies (One by one, strict syntax)

-- Residents View Own
DROP POLICY IF EXISTS "Residents can view their own authorizations" ON public.package_authorizations;
CREATE POLICY "Residents can view their own authorizations" ON public.package_authorizations FOR SELECT USING (auth.uid() = grantor_id OR auth.uid() = grantee_id);

-- Residents Create Own
DROP POLICY IF EXISTS "Residents can create authorizations" ON public.package_authorizations;
CREATE POLICY "Residents can create authorizations" ON public.package_authorizations FOR INSERT WITH CHECK (auth.uid() = grantor_id);

-- Residents Update Own
DROP POLICY IF EXISTS "Residents can update their own authorizations" ON public.package_authorizations;
CREATE POLICY "Residents can update their own authorizations" ON public.package_authorizations FOR UPDATE USING (auth.uid() = grantor_id);

-- Admins View All
DROP POLICY IF EXISTS "Admins can view all authorizations" ON public.package_authorizations;
CREATE POLICY "Admins can view all authorizations" ON public.package_authorizations FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'porter', 'super_admin', 'porteiro')));

-- 4. Update pickup_package RPC
CREATE OR REPLACE FUNCTION public.pickup_package(qr_text TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    pkg_record RECORD;
    current_user_id UUID := auth.uid();
    is_authorized BOOLEAN := FALSE;
    resident_profile RECORD;
    cleaned_qr TEXT;
BEGIN
    -- Clean QR code input (remove whitespace)
    cleaned_qr := TRIM(qr_text);

    -- 1. Find the package by QR Code
    SELECT * INTO pkg_record FROM public.packages WHERE qr_code = cleaned_qr LIMIT 1;

    IF pkg_record IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Encomenda não encontrada (QR: ' || cleaned_qr || ')');
    END IF;

    IF pkg_record.status = 'delivered' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Encomenda já retirada em ' || to_char(pkg_record.picked_up_at, 'DD/MM/YYYY HH24:MI'));
    END IF;

    -- 2. Verify Authorization
    -- A. User is the Owner (Resident)
    IF pkg_record.resident_id = current_user_id THEN
        is_authorized := TRUE;
    ELSE
        -- B. User is an Authorized Neighbor (Active Authorization)
        IF EXISTS (
            SELECT 1 FROM public.package_authorizations
            WHERE grantor_id = pkg_record.resident_id
            AND grantee_id = current_user_id
            AND status = 'active'
        ) THEN
            is_authorized := TRUE;
        END IF;
    END IF;

    IF NOT is_authorized THEN
        RETURN jsonb_build_object('success', false, 'message', 'Você não tem permissão para retirar esta encomenda.');
    END IF;

    -- 3. Perform Pickup Update
    SELECT phone INTO resident_profile FROM public.profiles WHERE id = current_user_id;

    UPDATE public.packages
    SET status = 'delivered',
        picked_up_by = current_user_id,
        picked_up_at = NOW(),
        receiver_phone = COALESCE(resident_profile.phone, 'App Scan')
    WHERE id = pkg_record.id;

    RETURN jsonb_build_object('success', true, 'message', 'Encomenda retirada com sucesso!');

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', 'Erro ao processar retirada: ' || SQLERRM);
END;
$$;
