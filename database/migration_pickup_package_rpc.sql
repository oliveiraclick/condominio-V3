-- Remote Procedure Call for Secure Package Pickup (Self-Service)
-- Allows Residents (Owners) and Authorized Neighbors to pick up packages by scanning the QR Code.
-- Bypasses strict RLS Select policies by running as SECURITY DEFINER.

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
BEGIN
    -- 1. Find the package by QR Code
    SELECT * INTO pkg_record FROM public.packages WHERE qr_code = qr_text LIMIT 1;

    IF pkg_record IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Encomenda não encontrada.');
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
    -- We gather user info for the digital signature (receiver_phone)
    SELECT phone INTO resident_profile FROM public.profiles WHERE id = current_user_id;

    UPDATE public.packages
    SET status = 'delivered',
        picked_up_by = current_user_id,
        picked_up_at = NOW(),
        receiver_phone = COALESCE(resident_profile.phone, 'App Scan')
    WHERE id = pkg_record.id;

    RETURN jsonb_build_object('success', true, 'message', 'Encomenda retirada com sucesso!');

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', 'Erro interno: ' || SQLERRM);
END;
$$;
