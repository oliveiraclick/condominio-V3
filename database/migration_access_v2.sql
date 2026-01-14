-- MIGRATION: Professional Access Control Architecture (Phase 1) - FIXED
-- Description: Establishes valid Tables for Hardware Integration (Hikvision/Control iD)

-- 1. ACCESS DEVICES (Cameras, Facial Terminals, Controllers)
CREATE TABLE IF NOT EXISTS access_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominium_id UUID REFERENCES condominiums(id) ON DELETE CASCADE,
    name TEXT NOT NULL, 
    ip_address TEXT, 
    device_type TEXT DEFAULT 'hikvision_facial', 
    location TEXT, 
    api_key TEXT, 
    status TEXT DEFAULT 'active', 
    last_ping TIMESTAMP WITH TIME ZONE, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. ACCESS LOGS (Immutable History)
CREATE TABLE IF NOT EXISTS access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominium_id UUID REFERENCES condominiums(id),
    device_id UUID REFERENCES access_devices(id),
    user_id UUID REFERENCES profiles(id),
    visitor_name TEXT, 
    event_type TEXT NOT NULL, 
    auth_method TEXT NOT NULL, 
    snapshot_url TEXT, 
    confidence_score NUMERIC, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. PROFILE EXTENSIONS (Sync Control)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS external_access_id TEXT, 
ADD COLUMN IF NOT EXISTS access_level TEXT DEFAULT 'resident', 
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'pending_create', 
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE;

-- 4. INDEXES (Performance)
CREATE INDEX IF NOT EXISTS idx_access_logs_condo ON access_logs(condominium_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_user ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_sync ON profiles(sync_status);

-- RLS POLICIES (Security)
ALTER TABLE access_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- Device Admin Policy
DROP POLICY IF EXISTS "Super Admins manage devices" ON access_devices;
CREATE POLICY "Super Admins manage devices" ON access_devices
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
    );

-- Log View Policy
DROP POLICY IF EXISTS "Admins view logs" ON access_logs;
CREATE POLICY "Admins view logs" ON access_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin'))
    );

-- Resident View Policy
DROP POLICY IF EXISTS "Residents view own logs" ON access_logs;
CREATE POLICY "Residents view own logs" ON access_logs
    FOR SELECT USING (
        user_id = auth.uid()
    );

-- Admin Insert Log Policy
DROP POLICY IF EXISTS "Admins insert logs" ON access_logs;
CREATE POLICY "Admins insert logs" ON access_logs
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
