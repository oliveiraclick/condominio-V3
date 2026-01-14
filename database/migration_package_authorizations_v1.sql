CREATE TABLE IF NOT EXISTS public.package_authorizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    grantor_id UUID REFERENCES public.profiles(id) NOT NULL,
    grantee_id UUID REFERENCES public.profiles(id) NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.package_authorizations ENABLE ROW LEVEL SECURITY;

-- Resident can view authorizations where they are the grantor or grantee
CREATE POLICY "Residents can view their own authorizations" ON public.package_authorizations
    FOR SELECT USING (auth.uid() = grantor_id OR auth.uid() = grantee_id);

-- Resident can insert authorizations where they are the grantor
CREATE POLICY "Residents can create authorizations" ON public.package_authorizations
    FOR INSERT WITH CHECK (auth.uid() = grantor_id);

-- Resident can update their own authorizations (to revoke)
CREATE POLICY "Residents can update their own authorizations" ON public.package_authorizations
    FOR UPDATE USING (auth.uid() = grantor_id);

-- Admins/Staff can view all
CREATE POLICY "Admins can view all authorizations" ON public.package_authorizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'porter', 'super_admin')
        )
    );
