-- Migration: Upgrade Professional Expenses to support Income/Expense types
-- and fix Policy conflicts

-- 1. Add 'type' column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'professional_expenses' 
    AND column_name = 'type'
  ) THEN
    ALTER TABLE professional_expenses ADD COLUMN type TEXT DEFAULT 'expense' CHECK (type IN ('expense', 'income'));
  END IF;
END $$;

-- 2. Drop existing policies to prevent "policy already exists" errors
DROP POLICY IF EXISTS "Professionals can view their own expenses" ON professional_expenses;
DROP POLICY IF EXISTS "Professionals can insert their own expenses" ON professional_expenses;
DROP POLICY IF EXISTS "Professionals can update their own expenses" ON professional_expenses;
DROP POLICY IF EXISTS "Professionals can delete their own expenses" ON professional_expenses;
DROP POLICY IF EXISTS "Admins can view all expenses" ON professional_expenses;

-- 3. Re-create Policies (Robustly)
CREATE POLICY "Professionals can view their own transactions"
  ON professional_expenses FOR SELECT
  USING (auth.uid() = professional_id);

CREATE POLICY "Professionals can insert their own transactions"
  ON professional_expenses FOR INSERT
  WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Professionals can update their own transactions"
  ON professional_expenses FOR UPDATE
  USING (auth.uid() = professional_id);

CREATE POLICY "Professionals can delete their own transactions"
  ON professional_expenses FOR DELETE
  USING (auth.uid() = professional_id);

CREATE POLICY "Admins can view all transactions"
  ON professional_expenses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );
