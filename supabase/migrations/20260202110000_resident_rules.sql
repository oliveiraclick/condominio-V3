-- Add is_primary_resident column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_primary_resident BOOLEAN DEFAULT false;

-- Update status check constraint to include 'inactive'
-- We first drop the existing constraint if it exists (name depends on Supabase generation, usually profiles_status_check)
-- But safe way is to just drop and add. 
-- However, we can simply ALTER the CHECK if we knew the name.
-- Let's try to add the new constraint.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'inactive'));
