-- Add status column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Add check constraint to ensure valid status values
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_status_check 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Update existing records to 'approved' to avoid blocking current users
UPDATE public.profiles SET status = 'approved' WHERE status IS NULL OR status = 'pending';

-- Reset default for new records to 'pending' (if needed, though schema change handles it)
ALTER TABLE public.profiles ALTER COLUMN status SET DEFAULT 'pending';
