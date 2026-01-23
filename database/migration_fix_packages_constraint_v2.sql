-- Migration: Fix Packages Status Constraint V2 (Add 'awaiting_confirmation')
-- Date: 2026-01-23
-- Context: The "Handshake" feature in Admin panel sets status to 'awaiting_confirmation',
-- which was missing from the previous constraint definition.

BEGIN;

-- 1. Drop the restrictive constraint
ALTER TABLE public.packages DROP CONSTRAINT IF EXISTS packages_status_check;

-- 2. Re-add with ALL used statuses
ALTER TABLE public.packages
ADD CONSTRAINT packages_status_check
CHECK (status IN (
    'pending',
    'delivered',
    'returned',
    'waiting_pickup',
    'awaiting_confirmation' -- Added this one
));

COMMIT;
