-- Atualização para Sistema de Reservas por Hora
-- Adiciona campos de horário específico e atualiza time_slot

-- Adicionar campos de horário específico
ALTER TABLE public.reservations 
ADD COLUMN IF NOT EXISTS start_time time,
ADD COLUMN IF NOT EXISTS end_time time,
ADD COLUMN IF NOT EXISTS time_slot text DEFAULT 'all_day';

-- Adicionar campos de horário disponível nas áreas comuns
ALTER TABLE public.common_areas
ADD COLUMN IF NOT EXISTS available_start_time time DEFAULT '06:00:00',
ADD COLUMN IF NOT EXISTS available_end_time time DEFAULT '22:00:00',
ADD COLUMN IF NOT EXISTS reservation_type text DEFAULT 'full_day'; -- 'hourly' ou 'full_day'

-- Atualizar áreas de esporte para reserva por hora
UPDATE public.common_areas 
SET reservation_type = 'hourly'
WHERE category = 'Esportes';

-- Atualizar outras áreas para dia inteiro
UPDATE public.common_areas 
SET reservation_type = 'full_day'
WHERE category IN ('Quiosques', 'Salão de Festas', 'Churrasqueira');

-- Criar constraint para validar horários
ALTER TABLE public.reservations
DROP CONSTRAINT IF EXISTS check_time_slot_or_times;

ALTER TABLE public.reservations
ADD CONSTRAINT check_time_slot_or_times 
CHECK (
  (time_slot IS NOT NULL AND start_time IS NULL AND end_time IS NULL) OR
  (time_slot IS NULL AND start_time IS NOT NULL AND end_time IS NOT NULL)
);

-- Atualizar índice único para incluir horários
DROP INDEX IF EXISTS unique_active_reservation;
CREATE UNIQUE INDEX unique_active_reservation_hourly 
ON public.reservations(area_id, date, start_time, end_time, resident_id) 
WHERE status != 'cancelled' AND start_time IS NOT NULL;

CREATE UNIQUE INDEX unique_active_reservation_slot 
ON public.reservations(area_id, date, time_slot, resident_id) 
WHERE status != 'cancelled' AND time_slot IS NOT NULL;
