-- Create marketplace table for Resident "Desapego"
CREATE TABLE IF NOT EXISTS public.marketplace (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  category TEXT DEFAULT 'Outros', -- Móveis, Eletrônicos, etc.
  status TEXT DEFAULT 'available', -- available, sold, negotiating
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.marketplace ENABLE ROW LEVEL SECURITY;

-- Policies
-- Anyone can view available items
CREATE POLICY "Anyone can view marketplace items" ON public.marketplace
  FOR SELECT USING (true);

-- Residents can insert their own items
CREATE POLICY "Residents can insert their own items" ON public.marketplace
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Sellers can update/delete their own items
CREATE POLICY "Sellers can update their own items" ON public.marketplace
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own items" ON public.marketplace
  FOR DELETE USING (auth.uid() = seller_id);

-- Storage bucket for marketplace images if not exists (reusing or creating new folder logic in frontend)
-- We can reuse 'products-images' or create 'marketplace-images'. 
-- For simplicity, let's assume we use the same 'products-images' bucket or a new one.
