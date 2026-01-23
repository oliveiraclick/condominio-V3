-- Diagnostic Script: Inspect Packages Constraints and Triggers
-- Run this to see what is currently enforcing rules on the 'packages' table.

SELECT
    conname AS constraint_name,
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM
    pg_constraint c
JOIN
    pg_namespace n ON n.oid = c.connamespace
WHERE
    conrelid = 'public.packages'::regclass
    AND n.nspname = 'public';

-- Also check triggers in case one of them is doing something weird
SELECT
    trigger_name,
    event_manipulation,
    action_statement
FROM
    information_schema.triggers
WHERE
    event_object_table = 'packages'
    AND event_object_schema = 'public';
