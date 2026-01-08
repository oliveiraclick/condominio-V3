-- Melhorias no Sistema de Reservas
-- Adiciona campos de horário e status, além de constraint para evitar duplicatas

-- Adicionar novos campos à tabela existente
ALTER TABLE public.reservations 
ADD COLUMN IF NOT EXISTS time_slot text DEFAULT 'all_day', -- 'morning', 'afternoon', 'evening', 'all_day'
ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;

-- Atualizar campo status para ter valores mais específicos
-- Nota: O campo 'status' já existe, apenas garantindo que aceita os novos valores
COMMENT ON COLUMN public.reservations.status IS 'pending, confirmed, cancelled';

-- Criar índice para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_reservations_date_area ON public.reservations(date, area_id);
CREATE INDEX IF NOT EXISTS idx_reservations_resident ON public.reservations(resident_id);

-- Criar constraint UNIQUE para evitar reservas duplicadas
-- (mesmo morador, mesma área, mesma data, mesmo horário, não cancelada)
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_reservation 
ON public.reservations(area_id, date, time_slot, resident_id) 
WHERE status != 'cancelled';

-- Atualizar RLS policies para permitir cancelamento
DROP POLICY IF EXISTS "Residents can update their own reservations" ON public.reservations;
CREATE POLICY "Residents can update their own reservations" ON public.reservations
  FOR UPDATE 
  USING (auth.uid() = resident_id)
  WITH CHECK (auth.uid() = resident_id);

-- Policy para admin gerenciar todas as reservas
DROP POLICY IF EXISTS "Admins can manage all reservations" ON public.reservations;
CREATE POLICY "Admins can manage all reservations" ON public.reservations
  FOR ALL
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
  );
