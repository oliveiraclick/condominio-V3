-- Fix RLS to allow 'picked_up_by' user to confirm (update) the package status.
-- Necessary for the Digital Handshake when a neighbor/proxy picks up the package.

DROP POLICY IF EXISTS "Residents update own" ON public.packages;

CREATE POLICY "Residents update own" ON public.packages
FOR UPDATE USING (
    resident_id = auth.uid() 
    OR 
    picked_up_by = auth.uid()
) WITH CHECK (
    resident_id = auth.uid() 
    OR 
    picked_up_by = auth.uid()
);
