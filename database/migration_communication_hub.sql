-- Migration: Communication Hub & Delivery System

-- 1. PACKAGES / DELLIVERY SYSTEM
CREATE TABLE IF NOT EXISTS public.packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    condo_id UUID REFERENCES public.condominiums(id),
    unit TEXT NOT NULL, -- e.g. "402-B"
    resident_id UUID REFERENCES public.profiles(id), -- Optional, if we can link to a user
    description TEXT NOT NULL,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'collected')),
    received_by UUID REFERENCES public.profiles(id), -- Staff who received it
    received_at TIMESTAMPTZ DEFAULT now(),
    collected_at TIMESTAMPTZ,
    collected_by UUID REFERENCES public.profiles(id) -- Resident who picked it up
);

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Policies for Packages
DROP POLICY IF EXISTS "Staff can manage packages" ON public.packages;
CREATE POLICY "Staff can manage packages"
    ON public.packages
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin', 'staff', 'concierge')
        )
    );

DROP POLICY IF EXISTS "Residents can view their own packages" ON public.packages;
CREATE POLICY "Residents can view their own packages"
    ON public.packages
    FOR SELECT
    TO authenticated
    USING (
        -- Match by exact resident_id OR by unit if resident_id is null/matching
        resident_id = auth.uid() 
        OR 
        (
            unit = (SELECT unit FROM public.profiles WHERE id = auth.uid())
        )
    );

-- 2. CHAT SYSTEM
CREATE TABLE IF NOT EXISTS public.chat_channels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    condo_id UUID REFERENCES public.condominiums(id),
    type TEXT DEFAULT 'support', -- 'support', 'neighborhood', etc.
    status TEXT DEFAULT 'open', -- 'open', 'closed', 'archived'
    
    -- For 'support' chats, we link a specific resident/unit
    resident_id UUID REFERENCES public.profiles(id),
    unit TEXT,
    
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.chat_channels ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id UUID REFERENCES public.chat_channels(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id),
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for Chat Channels
DROP POLICY IF EXISTS "Admins manage all channels" ON public.chat_channels;
CREATE POLICY "Admins manage all channels"
    ON public.chat_channels
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin', 'staff', 'concierge')
        )
    );

DROP POLICY IF EXISTS "Residents see their own channels" ON public.chat_channels;
CREATE POLICY "Residents see their own channels"
    ON public.chat_channels
    FOR ALL
    USING (resident_id = auth.uid());

-- Policies for Chat Messages
DROP POLICY IF EXISTS "Admins manage all messages" ON public.chat_messages;
CREATE POLICY "Admins manage all messages"
    ON public.chat_messages
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin', 'staff', 'concierge')
        )
    );

DROP POLICY IF EXISTS "Residents interact with their messages" ON public.chat_messages;
CREATE POLICY "Residents interact with their messages"
    ON public.chat_messages
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.chat_channels c
            WHERE c.id = channel_id
            AND c.resident_id = auth.uid()
        )
    );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_packages_unit ON public.packages(unit);
CREATE INDEX IF NOT EXISTS idx_packages_status ON public.packages(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON public.chat_messages(channel_id);
