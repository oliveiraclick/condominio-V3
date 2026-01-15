-- Migration: Create professional_expenses table for financial management
-- Description: Stores expenses/payables for service providers

CREATE TABLE IF NOT EXISTS professional_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  category TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_professional_expenses_professional_id ON professional_expenses(professional_id);
CREATE INDEX IF NOT EXISTS idx_professional_expenses_status ON professional_expenses(status);
CREATE INDEX IF NOT EXISTS idx_professional_expenses_due_date ON professional_expenses(due_date);

-- Add payment_status column to service_requests if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'service_requests' 
    AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE service_requests ADD COLUMN payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid'));
  END IF;
END $$;

-- Add price column to service_requests if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'service_requests' 
    AND column_name = 'price'
  ) THEN
    ALTER TABLE service_requests ADD COLUMN price DECIMAL(10, 2) DEFAULT 0;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE professional_expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Professionals can view their own expenses"
  ON professional_expenses FOR SELECT
  USING (auth.uid() = professional_id);

CREATE POLICY "Professionals can insert their own expenses"
  ON professional_expenses FOR INSERT
  WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Professionals can update their own expenses"
  ON professional_expenses FOR UPDATE
  USING (auth.uid() = professional_id);

CREATE POLICY "Professionals can delete their own expenses"
  ON professional_expenses FOR DELETE
  USING (auth.uid() = professional_id);

-- Admins can view all expenses
CREATE POLICY "Admins can view all expenses"
  ON professional_expenses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );
