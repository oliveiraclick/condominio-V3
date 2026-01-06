do $$
declare
  test_user_id uuid;
begin
  select id into test_user_id from auth.users limit 1;

  if test_user_id is not null then
    insert into maintenance_tickets (resident_id, title, description, category, status, location)
    values
      (test_user_id, 'Lâmpada Queimada', 'Luz do hall do 3º andar piscando.', 'Elétrica', 'Aberto', 'Torre A - 3º Andar'),
      (test_user_id, 'Portão da Garagem', 'Demora para fechar.', 'Segurança', 'Em Andamento', 'Térreo');
  end if;
end $$;
