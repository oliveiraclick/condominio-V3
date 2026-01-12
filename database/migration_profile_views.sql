-- Add views_count to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- Function to safely increment content (RPC)
CREATE OR REPLACE FUNCTION public.increment_profile_view(profile_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET views_count = views_count + 1
  WHERE id = profile_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
