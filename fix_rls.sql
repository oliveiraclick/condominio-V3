-- HABILITAR RLS (Segurança a nível de linha)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- REMOVER POLÍTICAS ANTIGAS (para garantir que não haja conflitos)
DROP POLICY IF EXISTS "Users can see own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- 1. PERMITIR QUE O USUÁRIO VEJA SEU PRÓPRIO PERFIL (CRÍTICO PARA LOGIN)
CREATE POLICY "Users can see own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 2. PERMITIR QUE O USUÁRIO ATUALIZE SEU PRÓPRIO PERFIL
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- 3. PERMITIR QUE ADMINS VEJAM TODOS OS PERFIS
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
