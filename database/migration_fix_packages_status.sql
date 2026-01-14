-- Drop the existing check constraint
ALTER TABLE public.packages DROP CONSTRAINT IF EXISTS packages_status_check;

-- Re-add the check constraint with correct values
ALTER TABLE public.packages 
ADD CONSTRAINT packages_status_check 
CHECK (status IN ('pending', 'delivered', 'returned', 'waiting_pickup'));

-- Update any existing invalid rows if necessary (optional safeguard)
-- UPDATE public.packages SET status = 'pending' WHERE status NOT IN ('pending', 'delivered', 'returned', 'waiting_pickup');
