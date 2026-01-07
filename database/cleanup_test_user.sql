-- LIMPEZA PARA TESTE REAL:
-- Rode isso para apagar o seu usuário de teste antigo e poder criar um novo 'virgem'

-- 1. Apagar do perfil
DELETE FROM public.profiles WHERE email = 'ia.oliveira.click@gmail.com';

-- 2. Apagar da autenticação (Isso permite cadastrar de novo com o mesmo email)
DELETE FROM auth.users WHERE email = 'ia.oliveira.click@gmail.com';

SELECT 'Usuário de teste removido. Pode cadastrar novamente!' as status;
