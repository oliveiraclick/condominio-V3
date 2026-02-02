-- CORREÇÃO DEFINITIVA DO PERFIL
-- O problema era: 
-- 1. O email estava vazio na tabela profiles
-- 2. O status 'active' não é permitido (tem que ser 'approved')

UPDATE profiles
SET 
  email = 'adm@morador.app',  -- Preenche o email que estava faltando
  status = 'approved',        -- Usa o status correto permitido
  role = 'admin'
WHERE id = '929532d3-f52f-4956-8362-63dfc0405b4e'; -- ID identificado no print

-- Verificar se ficou correto
SELECT id, email, name, role, status
FROM profiles
WHERE id = '929532d3-f52f-4956-8362-63dfc0405b4e';
