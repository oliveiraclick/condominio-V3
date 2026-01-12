-- Add timestamp to track when pro went on-site
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS on_site_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update trigger to set this timestamp automatically
CREATE OR REPLACE FUNCTION public.update_on_site_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_on_site = true AND OLD.is_on_site = false THEN
        NEW.on_site_updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_on_site_timestamp ON public.profiles;
CREATE TRIGGER set_on_site_timestamp
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_on_site_timestamp();
