-- CLEANUP (Optional: Remove existing categories to avoid duplicates during dev)
DELETE FROM public.categories WHERE name IN ('Manutenção', 'Limpeza', 'Transporte', 'Saúde', 'Aulas');

-- 1. PARENT CATEGORIES
-- We use DO block to capture IDs for sub-categories
DO $$
DECLARE
  manutencao_id UUID;
  limpeza_id UUID;
  aulas_id UUID;
BEGIN
  -- Create 'Manutenção'
  INSERT INTO public.categories (name, type, image_url)
  VALUES ('Manutenção', 'service', 'https://images.unsplash.com/photo-1581092921461-eab62e97a783?auto=format&fit=crop&w=500&q=60')
  RETURNING id INTO manutencao_id;

  -- Create 'Limpeza'
  INSERT INTO public.categories (name, type, image_url)
  VALUES ('Limpeza', 'service', 'https://images.unsplash.com/photo-1581578731117-10d52187b481?auto=format&fit=crop&w=500&q=60')
  RETURNING id INTO limpeza_id;

  -- Create 'Aulas'
  INSERT INTO public.categories (name, type, image_url)
  VALUES ('Aulas', 'service', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=60')
  RETURNING id INTO aulas_id;


  -- 2. SUB-CATEGORIES (Manutenção)
  INSERT INTO public.categories (name, type, parent_id) VALUES 
  ('Piscina', 'service', manutencao_id),
  ('Telhado', 'service', manutencao_id),
  ('Placa Solar', 'service', manutencao_id),
  ('Elétrica', 'service', manutencao_id),
  ('Hidráulica', 'service', manutencao_id),
  ('Ar Condicionado', 'service', manutencao_id);

  -- 2. SUB-CATEGORIES (Limpeza)
  INSERT INTO public.categories (name, type, parent_id) VALUES 
  ('Faxina Completa', 'service', limpeza_id),
  ('Pós Obra', 'service', limpeza_id),
  ('Estofados', 'service', limpeza_id);

  -- 2. SUB-CATEGORIES (Aulas)
  INSERT INTO public.categories (name, type, parent_id) VALUES 
  ('Personal Trainer', 'service', aulas_id),
  ('Inglês', 'service', aulas_id),
  ('Natação', 'service', aulas_id);

END $$;
