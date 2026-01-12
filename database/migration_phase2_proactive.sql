-- --- MURAL DE DEMANDAS (SERVICE DEMANDS) ---
CREATE TABLE IF NOT EXISTS service_demands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    condominium_id UUID REFERENCES condominiums(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open', -- 'open', 'closed', 'fulfilled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE service_demands ENABLE ROW LEVEL SECURITY;

-- Policies for service_demands
DROP POLICY IF EXISTS "Public read access for service_demands" ON service_demands;
CREATE POLICY "Public read access for service_demands" ON service_demands FOR SELECT USING (true);

DROP POLICY IF EXISTS "Residents can create own demands" ON service_demands;
CREATE POLICY "Residents can create own demands" ON service_demands FOR INSERT WITH CHECK (auth.uid() = resident_id);

DROP POLICY IF EXISTS "Residents can update own demands" ON service_demands;
CREATE POLICY "Residents can update own demands" ON service_demands FOR UPDATE USING (auth.uid() = resident_id);

-- --- CRM SIMPLES (LEADS) ---
CREATE TABLE IF NOT EXISTS professional_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    resident_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    source TEXT NOT NULL, -- 'whatsapp_click', 'profile_view', 'demand_response'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE professional_leads ENABLE ROW LEVEL SECURITY;

-- Policies for professional_leads
DROP POLICY IF EXISTS "Professionals can see own leads" ON professional_leads;
CREATE POLICY "Professionals can see own leads" ON professional_leads FOR SELECT USING (auth.uid() = professional_id);

DROP POLICY IF EXISTS "System can insert leads" ON professional_leads;
CREATE POLICY "System can insert leads" ON professional_leads FOR INSERT WITH CHECK (true); -- Allow insertion via client-side trigger

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_service_demands_condo ON service_demands(condominium_id);
CREATE INDEX IF NOT EXISTS idx_pro_leads_pro_id ON professional_leads(professional_id);
