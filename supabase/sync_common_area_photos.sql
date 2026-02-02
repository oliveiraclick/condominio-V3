-- Synchronize image_url with the first photo from the existing photos array
UPDATE public.common_areas 
SET image_url = photos[1]
WHERE photos IS NOT NULL AND array_length(photos, 1) > 0 AND image_url IS NULL;

-- If the user wants specific original photos for "Quiosque 01" and "Quiosque 02"
-- listed in database/seed.sql, let's ensure they are updated correctly if names match.
-- (This script assumes names are unique based on the constraint added earlier)

-- Update Quiosque 01 if it exists with original seed photo
UPDATE public.common_areas 
SET image_url = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'
WHERE name = 'Quiosque 01';

-- Update Quiosque 02 if it exists with original seed photo
UPDATE public.common_areas 
SET image_url = 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=800&q=80'
WHERE name = 'Quiosque 02';

-- Update Salão de Festas if it exists with original seed photo
UPDATE public.common_areas 
SET image_url = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80'
WHERE name = 'Salão de Festas';
