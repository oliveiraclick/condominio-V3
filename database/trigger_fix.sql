-- PASSO 1: Remover trigger antigo se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_full();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- PASSO 2: Criar função simplificada e robusta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir perfil básico (campos obrigatórios apenas)
  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Novo Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'resident'),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Evita erro se já existir

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASSO 3: Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- PASSO 4: Atualizar perfis existentes que não têm dados
UPDATE public.profiles
SET 
  name = COALESCE(name, 'Usuário'),
  role = COALESCE(role, 'resident')
WHERE name IS NULL OR role IS NULL;
