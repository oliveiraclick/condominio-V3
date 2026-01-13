-- Migration to add missing columns for Professionals
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialties TEXT[];

-- Update comment: This ensures SuperAdmin.tsx and Resident.tsx work correctly with professionals.
