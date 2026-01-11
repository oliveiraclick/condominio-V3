-- FINAL FIX FOR PUBLIC VISIBILITY
-- Using DO block to safely handle policy drops

DO $$
BEGIN
    -- Profiles
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public profiles are viewable by everyone' AND tablename = 'profiles') THEN
        DROP POLICY "Public profiles are viewable by everyone" ON profiles;
    END IF;
    
    -- Products
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public products viewable by everyone' AND tablename = 'products') THEN
        DROP POLICY "Public products viewable by everyone" ON products;
    END IF;

     -- Professional Services
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public services viewable by everyone' AND tablename = 'professional_services') THEN
        DROP POLICY "Public services viewable by everyone" ON professional_services;
    END IF;

    -- Marketplace
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public marketplace viewable by everyone' AND tablename = 'marketplace') THEN
         DROP POLICY "Public marketplace viewable by everyone" ON marketplace;
    END IF;
END $$;

-- Enable RLS on tables if not already (safeguard)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace ENABLE ROW LEVEL SECURITY;

-- Re-create Policies with strictly TRUE using
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public products viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Public services viewable by everyone" ON professional_services FOR SELECT USING (true);
CREATE POLICY "Public marketplace viewable by everyone" ON marketplace FOR SELECT USING (true);

-- Grant select to anon/authenticated for good measure
GRANT SELECT ON profiles TO anon, authenticated, service_role;
GRANT SELECT ON products TO anon, authenticated, service_role;
GRANT SELECT ON professional_services TO anon, authenticated, service_role;
GRANT SELECT ON marketplace TO anon, authenticated, service_role;
