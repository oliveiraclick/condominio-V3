-- Migrar tarefas com status 'open' para 'new'
UPDATE tasks
SET status = 'new'
WHERE status = 'open'
AND archived = false;

-- Verificar resultado
SELECT id, title, status, created_at
FROM tasks
WHERE archived = false
ORDER BY created_at DESC
LIMIT 10;
