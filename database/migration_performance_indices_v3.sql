-- PERFORMANCE INDICES FOR PACKAGES TABLE (V3)
-- Optimizes queries for Admin Dashboard and Resident View

-- 0. Enable required extensions for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin; -- Useful for GIN indexing on standard types

-- 1. Index for identifying active packages (status filter)
CREATE INDEX IF NOT EXISTS idx_packages_status ON public.packages (status);

-- 2. Index for sorting by creation date (default view)
CREATE INDEX IF NOT EXISTS idx_packages_created_at_desc ON public.packages (created_at DESC);

-- 3. Index for sorting by pickup date (history view)
CREATE INDEX IF NOT EXISTS idx_packages_picked_up_at_desc ON public.packages (picked_up_at DESC);

-- 4. Composite index for resident queries (filtering by resident + status)
CREATE INDEX IF NOT EXISTS idx_packages_resident_status ON public.packages (resident_id, status);

-- 5. Index for searching by resident name (if used often)
CREATE INDEX IF NOT EXISTS idx_packages_resident_name_trgm ON public.packages USING GIN (resident_name gin_trgm_ops);

-- Notify completion
SELECT 'Performance indices applied successfully' as result;
