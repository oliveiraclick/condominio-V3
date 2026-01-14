-- Add missing columns for delivery confirmation
ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS picked_up_by UUID REFERENCES profiles(id);
