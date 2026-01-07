-- TRIGGER COM TRIAL DE 60 DIAS PARA PROFISSIONAIS

-- 1. Limpar funções antigas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. Criar nova função com lógica de Trial
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_name TEXT;
  user_role TEXT;
  trial_date TIMESTAMP;
BEGIN
  -- Extrair dados básicos
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Usuário');
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'resident');
  
  -- Definir data de Trial (60 dias para profissionais, NULL para outros)
  IF user_role = 'professional' THEN
    trial_date := NOW() + INTERVAL '60 days';
  ELSE
    trial_date := NULL;
  END IF;

  RAISE LOG 'Criando perfil: % (Papel: %, Trial: %)', NEW.id, user_role, trial_date;

  -- Inserir ou Atualizar Perfil
  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    trial_ends_at,
    subscription_status,
    created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    user_role,
    trial_date,
    CASE WHEN user_role = 'professional' THEN 'trial' ELSE NULL END,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    trial_ends_at = COALESCE(profiles.trial_ends_at, EXCLUDED.trial_ends_at),
    subscription_status = COALESCE(profiles.subscription_status, EXCLUDED.subscription_status);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'ERRO no trigger handle_new_user para %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 3. Recriar Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Aplicar Trial aos profissionais existentes que não possuem data
UPDATE public.profiles
SET 
  trial_ends_at = created_at + INTERVAL '60 days',
  subscription_status = 'trial'
WHERE role = 'professional' 
AND trial_ends_at IS NULL;

SELECT 'Trigger atualizado com Trial de 60 dias!' as status;
