-- Script para testar as queries de produtos e marketplace

-- 1. Verificar se as tabelas existem
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as num_colunas
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('products', 'marketplace')
ORDER BY table_name;

-- 2. Ver estrutura da tabela products
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- 3. Ver estrutura da tabela marketplace
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'marketplace'
ORDER BY ordinal_position;

-- 4. Contar produtos
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE available = true) as disponiveis,
  COUNT(*) FILTER (WHERE available = false) as indisponiveis
FROM products;

-- 5. Contar marketplace items
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'available') as disponiveis,
  COUNT(*) FILTER (WHERE status != 'available') as outros_status
FROM marketplace;

-- 6. Ver produtos com join (como no código)
SELECT p.*, pr.name, pr.avatar
FROM products p
LEFT JOIN profiles pr ON p.vendor_id = pr.id
WHERE p.available = true
ORDER BY p.created_at DESC
LIMIT 5;

-- 7. Ver marketplace com join (como no código)
SELECT m.*, pr.name, pr.avatar
FROM marketplace m
LEFT JOIN profiles pr ON m.seller_id = pr.id
WHERE m.status = 'available'
ORDER BY m.created_at DESC
LIMIT 5;
