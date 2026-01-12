-- Phase 3: Auction System (Service Proposals)

CREATE TABLE IF NOT EXISTS public.service_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demand_id UUID NOT NULL REFERENCES public.service_demands(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    price DECIMAL(10, 2),
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(demand_id, professional_id) -- One proposal per pro per demand
);

-- Enable RLS
ALTER TABLE public.service_proposals ENABLE ROW LEVEL SECURITY;

-- Policies for service_proposals

-- 1. Pro can insert proposal
DROP POLICY IF EXISTS "Professionals can create proposals" ON public.service_proposals;
CREATE POLICY "Professionals can create proposals"
ON public.service_proposals FOR INSERT
TO authenticated
WITH CHECK (
    professional_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'professional'
    )
);

-- 2. Pro can read their own proposals
DROP POLICY IF EXISTS "Professionals can view their own proposals" ON public.service_proposals;
CREATE POLICY "Professionals can view their own proposals"
ON public.service_proposals FOR SELECT
TO authenticated
USING (professional_id = auth.uid());

-- 3. Resident can view proposals for their demands
DROP POLICY IF EXISTS "Residents can view proposals for their demands" ON public.service_proposals;
CREATE POLICY "Residents can view proposals for their demands"
ON public.service_proposals FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.service_demands d
        WHERE d.id = demand_id AND d.resident_id = auth.uid()
    )
);

-- 4. Resident can update status of proposals for their demands
DROP POLICY IF EXISTS "Residents can update proposal status" ON public.service_proposals;
CREATE POLICY "Residents can update proposal status"
ON public.service_proposals FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.service_demands d
        WHERE d.id = demand_id AND d.resident_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.service_demands d
        WHERE d.id = demand_id AND d.resident_id = auth.uid()
    )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_proposals_demand_id ON public.service_proposals(demand_id);
CREATE INDEX IF NOT EXISTS idx_proposals_professional_id ON public.service_proposals(professional_id);
