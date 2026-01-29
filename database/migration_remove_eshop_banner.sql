-- Migration to REMOVE the incorrect banner "E-SHOP VIZINHO"
-- User requested to remove it completely.

DELETE FROM public.banners
WHERE title ILIKE '%E-SHOP VIZINHO%'
   OR title ILIKE '%Compre e venda no condomínio%';

-- Also ensure no banner has the "E-SHOP VIZINHO" text in the future
-- This is a one-time cleanup.
