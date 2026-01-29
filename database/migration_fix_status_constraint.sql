-- Drop old constraint and add new one supporting 'pending_processing'
ALTER TABLE public.packages DROP CONSTRAINT IF EXISTS packages_status_check;
ALTER TABLE public.packages ADD CONSTRAINT packages_status_check 
    CHECK (status IN ('pending', 'delivered', 'pending_processing', 'returned'));
