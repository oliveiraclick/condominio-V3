-- Migration to support Sub-Categories
-- We add a self-referencing parent_id to the categories table.

ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE;

-- Optional: Index for better performance on joins
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
