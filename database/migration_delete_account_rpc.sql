-- FUNCTION: delete_client_user
-- DESCRIPTION: Allows a user to delete their own account (auth + profile)
-- SECURITY: SECURITY DEFINER allows it to run with higher privileges to delete from auth.users
-- BUT we MUST ensure it only deletes the calling user (auth.uid())

CREATE OR REPLACE FUNCTION delete_client_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();

  -- Safeguard: Ensure user is logged in
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete from public tables (Cascading usually handles this, but good to be explicit for GDPR)
  -- The ON DELETE CASCADE on foreign keys should handle profiles, reservations, etc.
  -- But if not, we delete profile first to be safe
  DELETE FROM public.profiles WHERE id = current_user_id;

  -- Delete from auth.users (This requires SECURITY DEFINER)
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_client_user TO authenticated;
