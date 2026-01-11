-- Create pro_guide_cards table
CREATE TABLE IF NOT EXISTS pro_guide_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    icon_name TEXT,
    bg_color TEXT DEFAULT 'bg-white',
    text_color TEXT DEFAULT 'text-slate-900',
    icon_bg_color TEXT DEFAULT 'bg-emerald-100',
    icon_color TEXT DEFAULT 'text-emerald-600',
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE pro_guide_cards ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public read access for guide cards" ON pro_guide_cards;
CREATE POLICY "Public read access for guide cards" ON pro_guide_cards FOR SELECT USING (true);

DROP POLICY IF EXISTS "SuperAdmin full access for guide cards" ON pro_guide_cards;
CREATE POLICY "SuperAdmin full access for guide cards" ON pro_guide_cards FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
);

-- Seed initial data matching current hardcoded cards
INSERT INTO pro_guide_cards (title, description, icon_name, bg_color, text_color, icon_bg_color, icon_color, sort_order)
VALUES 
('Vendas Diretas', 'Pague ZERO taxas. Suas vendas via WhatsApp são 100% suas.', 'BadgePercent', 'bg-slate-900', 'text-white', 'bg-violet-600', 'text-white', 1),
('Ultra Visibilidade', 'Sempre que estiver no condomínio, ligue o status para ir ao topo.', 'Zap', 'bg-white', 'text-slate-900', 'bg-emerald-100', 'text-emerald-600', 2),
('Sua Vitrine', 'Cadastre seus serviços e produtos para ser encontrado 24h.', 'Store', 'bg-white', 'text-slate-900', 'bg-amber-100', 'text-amber-600', 3);
