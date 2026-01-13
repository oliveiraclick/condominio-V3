-- Ensure all necessary columns exist first
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS start_time time;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS end_time time;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS time_slot text DEFAULT 'all_day';

-- Rename profile_id to resident_id if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservations' AND column_name = 'profile_id') THEN
    ALTER TABLE reservations RENAME COLUMN profile_id TO resident_id;
  END IF;
END $$;

-- Verify and add resident_id if it was missing completely (edge case)
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS resident_id uuid REFERENCES profiles(id);

-- Ensure policies use correct column name
DROP POLICY IF EXISTS "Users can insert reservations" ON reservations;
CREATE POLICY "Users can insert reservations" ON reservations FOR INSERT WITH CHECK ( auth.uid() = resident_id );

DROP POLICY IF EXISTS "Residents can update their own reservations" ON reservations;
CREATE POLICY "Residents can update their own reservations" ON reservations FOR UPDATE USING ( auth.uid() = resident_id );

-- Drop old index if exists and recreate with correct column
DROP INDEX IF EXISTS unique_active_reservation;
DROP INDEX IF EXISTS unique_active_reservation_hourly;
DROP INDEX IF EXISTS unique_active_reservation_slot;

CREATE UNIQUE INDEX IF NOT EXISTS unique_active_reservation_hourly 
ON public.reservations(area_id, date, start_time, end_time, resident_id) 
WHERE status != 'cancelled' AND start_time IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS unique_active_reservation_slot 
ON public.reservations(area_id, date, time_slot, resident_id) 
WHERE status != 'cancelled' AND time_slot IS NOT NULL;
