-- Insert a second demo banner to test carousel rotation
INSERT INTO public.banners (image_url, title, link_url, active, display_order)
SELECT 'https://images.unsplash.com/photo-1558981806-ec527fa84f3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Novas Regras da Piscina', '#', true, 2
WHERE NOT EXISTS (
    SELECT 1 FROM public.banners WHERE id >= 2 OR display_order = 2
);

-- Ensure first banner exists too if table is empty
INSERT INTO public.banners (image_url, title, link_url, active, display_order)
SELECT 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Bem-vindo ao Novo CondoHub', '#', true, 1
WHERE NOT EXISTS (
    SELECT 1 FROM public.banners
);
