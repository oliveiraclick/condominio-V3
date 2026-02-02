-- SCRIPT DE REPARAÇÃO FINAL (Com Limpeza de Dados Antigos)
-- Execute este script no SQL Editor do Supabase

-- 1. Criar colunas se não existirem
ALTER TABLE public.reservations 
ADD COLUMN IF NOT EXISTS start_time time,
ADD COLUMN IF NOT EXISTS end_time time,
ADD COLUMN IF NOT EXISTS date date,
ADD COLUMN IF NOT EXISTS time_slot text DEFAULT 'all_day',
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS unit text,
ADD COLUMN IF NOT EXISTS tower text;

-- 2. Renomear profile_id para resident_id se necessário
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservations' AND column_name = 'profile_id') THEN
    ALTER TABLE public.reservations RENAME COLUMN profile_id TO resident_id;
  END IF;
END $$;

ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS resident_id uuid REFERENCES public.profiles(id);

-- 3. REMOVER CONSTRAINTS ANTIGAS PARA NÃO TRAVAR O SCRIPT
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS check_time_slot_or_times;
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_status_check;

-- 4. LIMPEZA DE DADOS (Crucial para evitar o erro 23514)
-- Se houver linhas com horário E período, priorizamos o período (limpando horário) 
-- ou vice-versa. Aqui vamos limpar o período se houver horário preenchido.
UPDATE public.reservations 
SET time_slot = NULL 
WHERE start_time IS NOT NULL OR end_time IS NOT NULL;

-- 5. AGORA SIM, APLICAR A REGRA DE SEGURANÇA
ALTER TABLE public.reservations 
ADD CONSTRAINT check_time_slot_or_times 
CHECK (
  (time_slot IS NOT NULL AND start_time IS NULL AND end_time IS NULL) OR
  (time_slot IS NULL AND (start_time IS NOT NULL OR end_time IS NOT NULL))
);

-- 6. RLS (Permissões)
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public viewable reservations" ON public.reservations;
CREATE POLICY "Public viewable reservations" ON public.reservations FOR SELECT USING ( true );
DROP POLICY IF EXISTS "Users can insert reservations" ON public.reservations;
CREATE POLICY "Users can insert reservations" ON public.reservations FOR INSERT WITH CHECK ( auth.uid() = resident_id );
DROP POLICY IF EXISTS "Residents can update own reservations" ON public.reservations;
CREATE POLICY "Residents can update own reservations" ON public.reservations FOR UPDATE USING ( auth.uid() = resident_id );
