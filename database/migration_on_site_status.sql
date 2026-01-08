-- Add is_on_site column to profiles to track if professional is at the condo
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_on_site boolean DEFAULT false;

-- Policy ensures professionals can update their own status (already covered by generic update policy usually, but explicit is good if needed)
-- Assuming existing policy "Users can update own profile" covers this.
