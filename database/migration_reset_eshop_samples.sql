-- Migration to CLEANUP e-Shop and insert SAMPLE items (CORRECTED)
-- Fix: Replaced non-existent 'status' column with 'available' (boolean)

-- 1. Clean existing products
DELETE FROM public.products;

-- 2. Insert new sample products
DO $$
DECLARE
    v_vendor_id UUID;
BEGIN
    -- Try to get a valid vendor ID (e.g., first admin or first user)
    SELECT id INTO v_vendor_id FROM public.profiles LIMIT 1;

    IF v_vendor_id IS NOT NULL THEN
        
        -- 1. Cloro para Piscina
        INSERT INTO public.products (title, description, price, image_url, vendor_id, available, created_at)
        VALUES (
            'Cloro para Piscina HTH 10kg', 
            'Balde de cloro granulado 10 em 1. Ideal para manter sua piscina limpa e cristalina.', 
            150.00, 
            'https://images.unsplash.com/photo-1560090995-01632a28895b?auto=format&fit=crop&w=800&q=80',
            v_vendor_id, 
            true, -- available
            NOW()
        );

        -- 2. Chopeira Elétrica
        INSERT INTO public.products (title, description, price, image_url, vendor_id, available, created_at)
        VALUES (
            'Chopeira Elétrica 5 Litros', 
            'Chopeira portátil, gela em 5 minutos. Perfeita para churrascos no condomínio.', 
            899.00, 
            'https://images.unsplash.com/photo-1575037614876-c38a4d44f5b8?auto=format&fit=crop&w=800&q=80',
            v_vendor_id, 
            true,
            NOW()
        );

        -- 3. Máquina de Lavar Carro
        INSERT INTO public.products (title, description, price, image_url, vendor_id, available, created_at)
        VALUES (
            'Lavadora de Alta Pressão Karcher', 
            'Potente e econômica. Ótima para lavar carros, calçadas e áreas externas.', 
            450.00, 
            'https://images.unsplash.com/photo-1625937286074-9ca519d5d9cc?auto=format&fit=crop&w=800&q=80',
            v_vendor_id, 
            true,
            NOW()
        );

        -- 4. Moto Elétrica
        INSERT INTO public.products (title, description, price, image_url, vendor_id, available, created_at)
        VALUES (
            'Scooter Elétrica 1500W', 
            'Autonomia de 40km, bateria removível. Silenciosa e ecológica.', 
            7500.00, 
            'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
            v_vendor_id, 
            true,
            NOW()
        );

    END IF;
END $$;
