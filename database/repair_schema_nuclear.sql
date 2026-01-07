-- 🚨 SCRIPT DE REPARAÇÃO NUCLEAR (Versão Corrigida)

-- 1. Parar o erro 500: Remover gatilhos que podem estar quebrando o Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. Garantir Condomínio
CREATE TABLE IF NOT EXISTS public.condominiums (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  address text,
  created_at timestamp with time zone DEFAULT now()
);

INSERT INTO public.condominiums (name, address)
SELECT 'Vila Verde Residence', 'Rua das Flores, 123'
WHERE NOT EXISTS (SELECT 1 FROM public.condominiums);

-- 3. Garantir Estrutura de Perfis
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS condominium_id UUID REFERENCES public.condominiums(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'resident';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS category TEXT;

-- 4. Função de Trigger à prova de erros
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, category, condominium_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'resident'),
    NEW.raw_user_meta_data->>'category',
    (SELECT id FROM public.condominiums LIMIT 1)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    category = EXCLUDED.category;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Criar Trigger (Apenas no INSERT)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Forçar atualização do Cache do Supabase (Sintaxe Fixa)
COMMENT ON TABLE public.profiles IS 'Perfil sincronizado com Auth - v2';

-- 7. Confirmar o e-mail do prestador
UPDATE auth.users 
SET email_confirmed_at = now(), confirmation_token = NULL 
WHERE email = 'ia.oliveira.click@gmail.com';

SELECT 'Reparação concluída com sucesso!' as status;
