-- Attempt to find a valid user ID from auth.users
-- If no profile exists for that user, create one.
-- Then insert access_control records.

do $$
declare
  test_user_id uuid;
begin
  -- 1. Try to get an existing user from auth.users
  select id into test_user_id from auth.users limit 1;

  -- 2. If no user exists, raise notice (User needs to sign up manually first)
  if test_user_id is null then
    raise notice 'Nenhum usuário encontrado em auth.users. Crie um usuário no Authentication do Supabase primeiro.';
  else
    -- 3. Ensure profile exists for this user
    insert into profiles (id, name, email, unit, tower, role)
    values (test_user_id, 'Morador Teste', 'morador@teste.com', '101', 'A', 'resident')
    on conflict (id) do nothing;

    -- 4. Insert Access Control Data
    insert into access_control (resident_id, visitor_name, type, date, status)
    values
      (test_user_id, 'Carlos Silva (Técnico TV)', 'Serviço', '2026-01-08', 'Pendente'),
      (test_user_id, 'Ana Souza (Mãe)', 'Visita', '2026-01-08', 'Autorizado');
      
    raise notice 'Dados de acesso inseridos com sucesso para o usuário %', test_user_id;
  end if;
end $$;
