-- ITEM 1 DO PLANO MVP: Configuração de Segurança e RLS no Supabase

--------------------------------------------------------------------------------
-- 1. HABILITAR RLS (Row Level Security) EM TODAS AS TABELAS
--------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.condominiums ENABLE ROW LEVEL SECURITY;

-- Se estas tabelas já existirem no seu banco:
-- ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------------------
-- 2. POLÍTICAS PARA A TABELA 'PROFILES'
--------------------------------------------------------------------------------

-- Usuário pode ver seu próprio perfil
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Usuário pode atualizar seu próprio perfil
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Moradores podem ver perfis de profissionais
CREATE POLICY "Residents can view professional profiles" 
ON public.profiles FOR SELECT 
USING (role = 'professional');


--------------------------------------------------------------------------------
-- 3. POLÍTICAS PARA A TABELA 'CONDOMINIUMS'
--------------------------------------------------------------------------------

-- Todos os usuários logados podem ver os condomínios
CREATE POLICY "Authenticated users can view condominiums" 
ON public.condominiums FOR SELECT 
TO authenticated
USING (true);


--------------------------------------------------------------------------------
-- 4. INSTRUÇÕES MANUAIS (NÃO SQL)
--------------------------------------------------------------------------------
/*
   Para desabilitar a confirmação de e-mail (necessário para o MVP rodar rápido):
   
   1. Vá no seu Dashboard do Supabase
   2. Clique em "Authentication" (ícone de cadeado na esquerda)
   3. Vá em "Providers" > "Email"
   4. DESATIVE a opção "Confirm email"
   5. Clique em SAVE no pé da página
*/

SELECT 'Políticas de segurança aplicadas com sucesso!' as status;
