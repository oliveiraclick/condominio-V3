-- =====================================================
-- Migration: Service Time Periods
-- Description: Implements period-based scheduling system
-- Author: System
-- Date: 2026-01-08
-- =====================================================

-- Tabela para armazenar períodos disponíveis por serviço
CREATE TABLE IF NOT EXISTS service_time_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES professional_services(id) ON DELETE CASCADE,
  period_name TEXT NOT NULL, -- ex: "Manhã Cedo", "Tarde", "Final de Tarde"
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Validação: horário fim deve ser maior que horário início
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Adicionar campos em service_requests para preferência e período confirmado
ALTER TABLE service_requests 
ADD COLUMN IF NOT EXISTS resident_period_preference TEXT CHECK (
  resident_period_preference IN ('morning', 'afternoon', 'evening', 'night', 'anytime')
),
ADD COLUMN IF NOT EXISTS resident_period_notes TEXT, -- observações do morador
ADD COLUMN IF NOT EXISTS selected_period_id UUID REFERENCES service_time_periods(id),
ADD COLUMN IF NOT EXISTS confirmed_period_start TIME,
ADD COLUMN IF NOT EXISTS confirmed_period_end TIME,
ADD COLUMN IF NOT EXISTS period_confirmed_at TIMESTAMPTZ;

-- Adicionar tipo de agendamento na tabela de serviços
ALTER TABLE professional_services 
ADD COLUMN IF NOT EXISTS booking_type TEXT DEFAULT 'whatsapp' 
CHECK (booking_type IN ('whatsapp', 'agenda'));

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_service_periods_service ON service_time_periods(service_id);
CREATE INDEX IF NOT EXISTS idx_service_periods_active ON service_time_periods(service_id, active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_service_requests_period ON service_requests(selected_period_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_preference ON service_requests(resident_period_preference);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_service_time_periods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_service_time_periods_updated_at ON service_time_periods;
CREATE TRIGGER trigger_update_service_time_periods_updated_at
  BEFORE UPDATE ON service_time_periods
  FOR EACH ROW
  EXECUTE FUNCTION update_service_time_periods_updated_at();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

ALTER TABLE service_time_periods ENABLE ROW LEVEL SECURITY;

-- Prestadores podem gerenciar períodos dos próprios serviços
DROP POLICY IF EXISTS "Prestadores gerenciam períodos próprios" ON service_time_periods;
CREATE POLICY "Prestadores gerenciam períodos próprios"
ON service_time_periods FOR ALL
USING (
  service_id IN (
    SELECT id FROM professional_services 
    WHERE provider_id = auth.uid()
  )
)
WITH CHECK (
  service_id IN (
    SELECT id FROM professional_services 
    WHERE provider_id = auth.uid()
  )
);

-- Moradores podem ver períodos de serviços ativos
DROP POLICY IF EXISTS "Moradores visualizam períodos ativos" ON service_time_periods;
CREATE POLICY "Moradores visualizam períodos ativos"
ON service_time_periods FOR SELECT
USING (
  active = true AND
  service_id IN (
    SELECT id FROM professional_services WHERE active = true
  )
);

-- Super admins podem ver tudo
DROP POLICY IF EXISTS "Super admins veem todos períodos" ON service_time_periods;
CREATE POLICY "Super admins veem todos períodos"
ON service_time_periods FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- =====================================================
-- Comentários para documentação
-- =====================================================

COMMENT ON TABLE service_time_periods IS 'Períodos de disponibilidade configurados por prestadores para cada serviço';
COMMENT ON COLUMN service_time_periods.period_name IS 'Nome descritivo do período (ex: Manhã Cedo, Tarde)';
COMMENT ON COLUMN service_time_periods.start_time IS 'Horário de início do período';
COMMENT ON COLUMN service_time_periods.end_time IS 'Horário de fim do período';
COMMENT ON COLUMN service_requests.resident_period_preference IS 'Preferência de período do morador: morning, afternoon, evening, night, anytime';
COMMENT ON COLUMN service_requests.resident_period_notes IS 'Observações do morador sobre disponibilidade (ex: só tenho alguém em casa à tarde)';
COMMENT ON COLUMN service_requests.selected_period_id IS 'Período escolhido pelo prestador para atender';
COMMENT ON COLUMN service_requests.confirmed_period_start IS 'Horário de início confirmado pelo prestador';
COMMENT ON COLUMN service_requests.confirmed_period_end IS 'Horário de fim confirmado pelo prestador';

-- Migração concluída com sucesso.
