-- Verificar se a migração funcionou
SELECT id, title, status, archived, created_at
FROM tasks
ORDER BY created_at DESC
LIMIT 10;

-- Verificar se há algum filtro ou problema
SELECT 
    status,
    archived,
    COUNT(*) as total
FROM tasks
GROUP BY status, archived
ORDER BY status, archived;
