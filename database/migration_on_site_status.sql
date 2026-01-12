-- Add is_on_site column to profiles to track if professional is at the condo
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_on_site boolean DEFAULT false;
    
    -- Policy ensures professionals can update their own status
