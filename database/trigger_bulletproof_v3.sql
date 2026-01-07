-- TRIGGER BULLETPROOF V3: Sincronização Total (Moradores & Profissionais)
-- Este script prepara o banco para receber TODOS os dados do cadastro.

-- 1. Assegurar que TODAS as colunas necessárias existam
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rg TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tower TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS spouse_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '60 days');
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS condominium_id UUID REFERENCES public.condominiums(id);

-- 2. Limpeza profunda
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3. Função Universal de Sincronização
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE LOG '🔵 [CONDO-TRIGGER] Iniciando para: %', NEW.email;

  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    phone,
    cpf,
    rg,
    category,
    tower,
    unit,
    spouse_name,
    is_free,
    subscription_status,
    trial_ends_at,
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
    NEW.raw_user_meta_data->>'rg',
    NEW.raw_user_meta_data->>'category',
    NEW.raw_user_meta_data->>'tower',
    NEW.raw_user_meta_data->>'unit',
    NEW.raw_user_meta_data->>'spouse_name',
    TRUE,
    CASE WHEN (NEW.raw_user_meta_data->>'role') = 'professional' THEN 'trial' ELSE NULL END,
    CASE WHEN (NEW.raw_user_meta_data->>'role') = 'professional' THEN (now() + interval '60 days') ELSE NULL END,
    (NEW.raw_user_meta_data->>'condo_id')::UUID,
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

  RAISE LOG '✅ [CONDO-TRIGGER] Perfil criado/atualizado com sucesso.';
  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  RAISE LOG '❌ [CONDO-TRIGGER ERROR] Falha ao sincronizar %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- 4. Re-ativar Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Sincronizar Retroativamente todos os usuários
INSERT INTO public.profiles (
    id, email, name, role, phone, cpf, rg, category, tower, unit, spouse_name, created_at
)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', email, 'Usuário'),
    COALESCE(raw_user_meta_data->>'role', 'resident'),
    raw_user_meta_data->>'phone',
    raw_user_meta_data->>'cpf',
    raw_user_meta_data->>'rg',
    raw_user_meta_data->>'category',
    raw_user_meta_data->>'tower',
    raw_user_meta_data->>'unit',
    raw_user_meta_data->>'spouse_name',
    created_at
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
    phone = EXCLUDED.phone,
    cpf = EXCLUDED.cpf,
    rg = EXCLUDED.rg,
    category = EXCLUDED.category,
    tower = EXCLUDED.tower,
    unit = EXCLUDED.unit,
    spouse_name = EXCLUDED.spouse_name;

SELECT 'Configuração V3 (TOTAL) aplicada com sucesso!' as status;
