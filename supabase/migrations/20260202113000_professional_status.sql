-- Update status check constraint to include professional statuses
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'inactive', 'awaiting_payment', 'suspended', 'blocked'));
