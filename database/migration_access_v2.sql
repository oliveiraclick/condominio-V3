-- MIGRATION: Professional Access Control Architecture (Phase 1)
-- Description: Establishes valid Tables for Hardware Integration (Hikvision/Control iD)
-- Safe to Run: Yes (Adds new tables/columns, does not alter existing logic)

-- 1. ACCESS DEVICES (Cameras, Facial Terminals, Controllers)
CREATE TABLE IF NOT EXISTS access_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominium_id UUID REFERENCES condominiums(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., "Portaria Social", "Garagem 1"
    ip_address TEXT, -- Local IP (for the local agent to use)
    device_type TEXT DEFAULT 'hikvision_facial', -- hikvision, control_id, etc.
    location TEXT, -- 'social_entry', 'service_entry', 'garage'
    api_key TEXT, -- Secret token for authentication
    status TEXT DEFAULT 'active', -- active, offline, maintenance
    last_ping TIMESTAMP WITH TIME ZONE, -- When the device last contacted the server
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. ACCESS LOGS (Immutable History)
CREATE TABLE IF NOT EXISTS access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominium_id UUID REFERENCES condominiums(id),
    device_id UUID REFERENCES access_devices(id),
    user_id UUID REFERENCES profiles(id), -- Nullable (if unknown/visitor)
    visitor_name TEXT, -- If not a registered profile
    
    event_type TEXT NOT NULL, -- 'entry_granted', 'entry_denied', 'exit'
    auth_method TEXT NOT NULL, -- 'facial', 'tag', 'app_remote', 'qr_code'
    
    snapshot_url TEXT, -- URL of the photo taken at the moment of access
    confidence_score NUMERIC, -- Facial recognition confidence (0-100)
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. PROFILE EXTENSIONS (Sync Control)
-- Adding columns to existing Profiles table to manage hardware sync status
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS external_access_id TEXT, -- The ID stored inside the Camera (e.g. "1001")
ADD COLUMN IF NOT EXISTS access_level TEXT DEFAULT 'resident', -- resident, staff, blocked, vip
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'pending_create', -- synced, pending_create, pending_update, pending_delete
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE;

-- 4. INDEXES (Performance)
CREATE INDEX IF NOT EXISTS idx_access_logs_condo ON access_logs(condominium_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_user ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_sync ON profiles(sync_status);

-- 5. RLS POLICIES (Security)
ALTER TABLE access_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- Device Policies
CREATE POLICY "Super Admins manage devices" ON access_devices
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
    );

-- Log Policies
CREATE POLICY "Admins view logs" ON access_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin'))
    );

CREATE POLICY "Residents view own logs" ON access_logs
    FOR SELECT USING (
        user_id = auth.uid()
    );

-- Allow the "Bridge Agent" (via Service Role) to Insert logs
-- (Service Role bypasses RLS, so explicit INSERT policy usually not needed for Backend, 
-- but good to allow Authenticated Admins to manually log if needed)
CREATE POLICY "Admins insert logs" ON access_logs
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
