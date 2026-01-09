-- Verificar produtos e desapegos

-- 1. Contar produtos
SELECT COUNT(*) as total_produtos FROM products;

-- 2. Contar desapegos
SELECT COUNT(*) as total_desapegos FROM marketplace;

-- 3. Ver produtos disponíveis
SELECT id, title, price, available, vendor_id FROM products WHERE available = true LIMIT 5;

-- 4. Ver desapegos disponíveis
SELECT id, title, price, status, seller_id FROM marketplace WHERE status = 'available' LIMIT 5;
