-- Function to confirm package pickup securely
CREATE OR REPLACE FUNCTION confirm_package_pickup(
  p_package_id uuid,
  p_resident_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pkg public.packages%ROWTYPE;
BEGIN
  -- Select package
  SELECT * INTO v_pkg FROM public.packages WHERE id = p_package_id;
  
  IF v_pkg IS NULL THEN
    RAISE EXCEPTION 'Pacote não encontrado';
  END IF;

  -- Verify ownership (modify logic if neighbor pickup is allowed)
  IF v_pkg.resident_id != p_resident_id AND v_pkg.picked_up_by != p_resident_id THEN
     RAISE EXCEPTION 'Este pacote não pertence a este morador';
  END IF;

  -- Update package
  UPDATE public.packages
  SET 
    status = 'completed',
    picked_up_at = now(),
    confirmed_by_resident_at = now()
  WHERE id = p_package_id;
  
  RETURN true;
END;
$$;

-- Function to confirm receipt by resident (Resident App Action)
CREATE OR REPLACE FUNCTION resident_confirm_receipt(
  p_package_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Ensure the user calling this is the owner
  UPDATE public.packages
  SET 
    status = 'completed',
    confirmed_by_resident_at = now()
  WHERE id = p_package_id
  AND resident_id = auth.uid(); -- Security check
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;
