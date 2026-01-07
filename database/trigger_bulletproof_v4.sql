-- TRIGGER BULLETPROOF V4: A Prova de Falhas (Sincronização Total)
-- Resolve o problema de campos faltando e de foreign keys (condominio_id).

-- 1. Garantir colunas na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rg TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tower TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS spouse_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS condominium_id UUID REFERENCES public.condominiums(id);

-- 2. Limpar tudo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3. Função Ultra Robusta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  default_condo_id UUID;
  meta_condo_id TEXT;
BEGIN
  RAISE LOG '🔵 [ULTRA-TRIGGER] Iniciando para: %', NEW.email;

  -- Tentar pegar o ID do condomínio do metadado
  meta_condo_id := NEW.raw_user_meta_data->>'condo_id';
  
  -- Se não veio no metadado, pegar o PRIMEIRO condomínio que existir no banco
  IF meta_condo_id IS NULL OR meta_condo_id = '' THEN
     SELECT id INTO default_condo_id FROM public.condominiums LIMIT 1;
     RAISE LOG '🔵 [ULTRA-TRIGGER] Condo ID não enviado. Usando fallback: %', default_condo_id;
  ELSE
     default_condo_id := meta_condo_id::UUID;
  END IF;

  INSERT INTO public.profiles (
    id, email, name, role, phone, cpf, rg, category, 
    tower, unit, spouse_name, is_free, 
    subscription_status, trial_ends_at, condominium_id, created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'resident'),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'cpf',
    NEW.raw_user_meta_data->>'rg',
    NEW.raw_user_meta_data->>'category',
    NEW.raw_user_meta_data->>'tower',
    NEW.raw_user_meta_data->>'unit',
    NEW.raw_user_meta_data->>'spouse_name',
    TRUE,
    CASE WHEN (NEW.raw_user_meta_data->>'role') = 'professional' THEN 'trial' ELSE NULL END,
    CASE WHEN (NEW.raw_user_meta_data->>'role') = 'professional' THEN (now() + interval '60 days') ELSE NULL END,
    default_condo_id,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    cpf = EXCLUDED.cpf,
    rg = EXCLUDED.rg,
    category = EXCLUDED.category,
    tower = EXCLUDED.tower,
    unit = EXCLUDED.unit,
    spouse_name = EXCLUDED.spouse_name,
    condominium_id = EXCLUDED.condominium_id;

  RAISE LOG '✅ [ULTRA-TRIGGER] Perfil sincronizado com sucesso.';
  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  RAISE LOG '❌ [ULTRA-TRIGGER ERROR] Erro fatal ao sincronizar %: %', NEW.id, SQLERRM;
  -- Mesmo com erro, permite criar o usuário no Auth
  RETURN NEW;
END;
$$;

-- 4. Re-criar Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Forçar sincronização imediata de usuários existentes sem perfil
INSERT INTO public.profiles (id, email, name, role, phone, cpf, rg, category, tower, unit, spouse_name, condominium_id, created_at)
SELECT 
    u.id, 
    u.email, 
    COALESCE(u.raw_user_meta_data->>'full_name', u.email, 'Usuário'),
    COALESCE(u.raw_user_meta_data->>'role', 'resident'),
    u.raw_user_meta_data->>'phone',
    u.raw_user_meta_data->>'cpf',
    u.raw_user_meta_data->>'rg',
    u.raw_user_meta_data->>'category',
    u.raw_user_meta_data->>'tower',
    u.raw_user_meta_data->>'unit',
    u.raw_user_meta_data->>'spouse_name',
    (SELECT id FROM public.condominiums LIMIT 1),
    u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

SELECT 'Configuração V4 (ULTRA) aplicada com sucesso!' as status;
