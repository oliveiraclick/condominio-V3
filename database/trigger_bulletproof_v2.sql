-- TRIGGER BULLETPROOF V2: Suporte total a Profissionais e Moradores
-- Este script garante que as colunas existam e o trigger salve TUDO.

-- 1. Garantir que as colunas existam na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tower TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS condominium_id UUID REFERENCES public.condominiums(id);

-- 2. Limpar trigger antigo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3. Criar função aprimorada
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Log de entrada
  RAISE LOG '🔵 [TRIGGER] Criando perfil para: % (%)', NEW.email, (NEW.raw_user_meta_data->>'role');

  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    phone,
    cpf,
    category,
    tower,
    unit,
    condominium_id,
    created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'resident'),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'cpf',
    NEW.raw_user_meta_data->>'category',
    NEW.raw_user_meta_data->>'tower',
    NEW.raw_user_meta_data->>'unit',
    (NEW.raw_user_meta_data->>'condo_id')::UUID,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    cpf = EXCLUDED.cpf,
    category = EXCLUDED.category,
    tower = EXCLUDED.tower,
    unit = EXCLUDED.unit,
    condominium_id = EXCLUDED.condominium_id;

  RAISE LOG '✅ [TRIGGER] Perfil salvo com sucesso.';
  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  RAISE LOG '❌ [TRIGGER ERROR] Erro ao criar perfil para %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- 4. Re-criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Sincronizar qualquer usuário que tenha ficado pra trás
INSERT INTO public.profiles (id, email, name, role, phone, cpf, category, tower, unit, condominium_id, created_at)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', email, 'Usuário'),
    COALESCE(raw_user_meta_data->>'role', 'resident'),
    raw_user_meta_data->>'phone',
    raw_user_meta_data->>'cpf',
    raw_user_meta_data->>'category',
    raw_user_meta_data->>'tower',
    raw_user_meta_data->>'unit',
    (raw_user_meta_data->>'condo_id')::UUID,
    created_at
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
    phone = EXCLUDED.phone,
    cpf = EXCLUDED.cpf,
    category = EXCLUDED.category;

SELECT 'Configuração V2 aplicada com sucesso!' as status;
