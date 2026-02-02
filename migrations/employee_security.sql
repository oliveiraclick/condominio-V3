-- Validação de status ativo no login
-- Este script deve ser executado como uma função trigger ou validação no backend

-- Função para validar status do funcionário no login
CREATE OR REPLACE FUNCTION validate_employee_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Se for funcionário, verificar se está ativo
  IF NEW.role = 'employee' AND NEW.status != 'active' THEN
    RAISE EXCEPTION 'Funcionário inativo. Entre em contato com o administrador.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar status antes de permitir acesso
-- (Nota: Isso é mais para documentação, a validação real deve ser feita no App.tsx)

-- Verificar funcionários inativos
SELECT 
  id,
  name,
  email,
  function,
  status,
  permissions
FROM profiles
WHERE role = 'employee'
AND status = 'inactive';
