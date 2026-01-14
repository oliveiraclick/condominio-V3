-- Migration Phase 2: Advanced Branding
-- Adding columns for the specific watermark symbol and its opacity

ALTER TABLE condominiums ADD COLUMN IF NOT EXISTS symbol_url text;
ALTER TABLE condominiums ADD COLUMN IF NOT EXISTS symbol_opacity integer DEFAULT 15; -- Default opacity 15%
