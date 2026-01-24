-- Create tables for Mural de Oportunidades

-- Table for service demands (requests from residents)
CREATE TABLE IF NOT EXISTS service_demands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  unit TEXT,
  tower TEXT,
  condominium_id UUID REFERENCES condominiums(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for service proposals (offers from professionals)
CREATE TABLE IF NOT EXISTS service_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demand_id UUID NOT NULL REFERENCES service_demands(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  price NUMERIC,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(demand_id, professional_id)
);

-- RLS (simplified for first implementation, can be hardened later if needed)
ALTER TABLE service_demands ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_proposals ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read and insert (logic will filter by condo_id in app)
CREATE POLICY "Allow all on service_demands" ON service_demands FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on service_proposals" ON service_proposals FOR ALL USING (true) WITH CHECK (true);
