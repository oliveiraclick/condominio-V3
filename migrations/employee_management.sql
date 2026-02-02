-- ================================================
-- MIGRAÇÃO: Sistema de Gerenciamento de Funcionários
-- ================================================

-- 1. Adicionar campos na tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS function VARCHAR(100),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_role_status 
ON profiles(role, status) 
WHERE role = 'employee';

CREATE INDEX IF NOT EXISTS idx_profiles_permissions 
ON profiles USING gin(permissions);

-- 3. RLS Policies para Funcionários

-- Funcionários podem ver apenas seus próprios dados
DROP POLICY IF EXISTS "employees_read_own" ON profiles;
CREATE POLICY "employees_read_own"
ON profiles FOR SELECT
USING (
  auth.uid() = id 
  AND role = 'employee'
);

-- Apenas admins podem gerenciar funcionários
DROP POLICY IF EXISTS "admin_manage_employees" ON profiles;
CREATE POLICY "admin_manage_employees"
ON profiles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'superadmin')
  )
);

-- 4. Função helper para verificar permissões
CREATE OR REPLACE FUNCTION check_employee_permission(
  employee_id UUID,
  module_name TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (permissions->module_name)::boolean,
      false
    )
    FROM profiles
    WHERE id = employee_id
    AND role = 'employee'
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Verificar migração
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('function', 'status', 'permissions');

-- 6. Exemplo de uso
-- UPDATE profiles 
-- SET 
--   function = 'Porteiro',
--   status = 'active',
--   permissions = '{"tasks": true, "packages": true, "communication": false}'::jsonb
-- WHERE id = 'employee-uuid-here';
