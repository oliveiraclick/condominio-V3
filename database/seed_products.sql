-- 1. Create table if it doesn't exist (SAFE TO RUN MULTIPLE TIMES)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  category TEXT DEFAULT 'Outros', -- Manutenção, Limpeza, Alimentação, Estética
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS 
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies (if they don't exist, ignore errors or drop first)
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (available = true);

DROP POLICY IF EXISTS "Vendors can manage own products" ON public.products;
CREATE POLICY "Vendors can manage own products" ON public.products FOR ALL USING (auth.uid() = vendor_id);

-- 4. INSERT TEST DATA (Assigns to the first user found in profiles)
-- Item 1: Kit Ferramentas
INSERT INTO public.products (vendor_id, title, description, price, category, image_url)
SELECT 
    id, 
    'Kit Ferramentas Premium', 
    'Kit completo com furadeira de impacto, jogo de chaves e maleta organizadora. Ideal para pequenos reparos.', 
    249.90, 
    'Manutenção', 
    'https://images.unsplash.com/photo-1581147036324-c17ac41d1685?auto=format&fit=crop&w=600&q=80'
FROM public.profiles 
LIMIT 1;

-- Item 2: Combo Limpeza
INSERT INTO public.products (vendor_id, title, description, price, category, image_url)
SELECT 
    id, 
    'Higienização de Sofá', 
    'Limpeza profunda e impermeabilização de sofás de até 3 lugares. Remoção de manchas e odores.', 
    180.00, 
    'Limpeza', 
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80'
FROM public.profiles 
LIMIT 1;

-- Item 3: Marmitas Fit
INSERT INTO public.products (vendor_id, title, description, price, category, image_url)
SELECT 
    id, 
    'Combo 10 Marmitas Fit', 
    'Refeições saudáveis e balanceadas. Cardápio variada com frango, carne e opções vegetarianas. Entrega grátis no condomínio.', 
    129.90, 
    'Alimentação', 
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80'
FROM public.profiles 
LIMIT 1;

SELECT 'e-Shop configurado com 3 produtos de teste!' as status;
