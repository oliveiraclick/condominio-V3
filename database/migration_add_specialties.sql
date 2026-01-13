-- Add specialties column to profiles table to support tags
-- Using TEXT[] array type for native tagging support

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'specialties') THEN
        ALTER TABLE public.profiles ADD COLUMN specialties TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Update RLS policies to ensure it's readable/writable
-- (Existing policies usually cover 'all columns' but verifying just in case)
