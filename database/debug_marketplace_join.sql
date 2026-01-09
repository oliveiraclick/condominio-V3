-- Verificar problema com marketplace

-- 1. Ver se há desapegos
SELECT COUNT(*) FROM marketplace;

-- 2. Ver desapegos com status
SELECT id, title, status, seller_id FROM marketplace LIMIT 5;

-- 3. Tentar fazer o join como no código
SELECT m.*, p.name, p.avatar
FROM marketplace m
LEFT JOIN profiles p ON m.seller_id = p.id
WHERE m.status = 'available'
LIMIT 5;

-- 4. Ver se seller_id está em profiles
SELECT m.id, m.title, m.seller_id, p.id as profile_id, p.name
FROM marketplace m
LEFT JOIN profiles p ON m.seller_id = p.id
LIMIT 5;
