-- DIAGNÓSTICO: Verificar se o trigger existe
SELECT 
    tgname as trigger_name,
    tgenabled as enabled,
    proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';

-- Se retornar vazio, o trigger NÃO foi criado!
-- Se retornar algo, o trigger existe mas pode estar falhando

-- VERIFICAR se a função existe
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname LIKE '%handle_new_user%';
