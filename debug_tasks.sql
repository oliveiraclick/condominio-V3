-- Verificar todas as tarefas criadas recentemente
SELECT 
    id,
    title,
    status,
    category,
    priority,
    created_at,
    created_by,
    archived
FROM tasks
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 10;

-- Contar tarefas por status
SELECT 
    status,
    COUNT(*) as total
FROM tasks
WHERE archived = false
GROUP BY status;
