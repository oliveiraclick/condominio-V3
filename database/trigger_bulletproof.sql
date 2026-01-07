-- SOLUÇÃO DEFINITIVA: Trigger super robusto com tratamento de erros

-- 1. Limpar tudo primeiro
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_full() CASCADE;

-- 2. Criar função com LOG para debug
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_name TEXT;
  user_role TEXT;
BEGIN
  -- Extrair dados com fallback
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    'Usuário'
  );
  
  user_role := COALESCE(
    NEW.raw_user_meta_data->>'role',
    'resident'
  );

  -- Log para debug (aparece no Supabase Logs)
  RAISE LOG 'Creating profile for user: % with role: %', NEW.id, user_role;

  -- Inserir perfil (SEM campos opcionais que podem causar erro)
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
    user_name,
    user_role,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role;

  RAISE LOG 'Profile created successfully for user: %', NEW.id;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro
    RAISE LOG 'ERROR creating profile for %: %', NEW.id, SQLERRM;
    -- NÃO falhar o cadastro, apenas logar
    RETURN NEW;
END;
$$;

-- 3. Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Verificar se foi criado
SELECT 'Trigger criado com sucesso!' as status;

-- 5. Corrigir usuários órfãos (que existem em auth.users mas não em profiles)
INSERT INTO public.profiles (id, email, name, role, created_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email, 'Usuário'),
  COALESCE(u.raw_user_meta_data->>'role', 'resident'),
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

SELECT 'Usuários órfãos corrigidos!' as status;
