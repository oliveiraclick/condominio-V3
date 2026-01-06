do $$
declare
  test_user_id uuid;
begin
  select id into test_user_id from auth.users limit 1;

  if test_user_id is not null then
    -- Insert dummy review
    insert into reviews (provider_id, resident_id, rating, comment)
    values (test_user_id, test_user_id, 5, 'Excelente serviço, muito rápido e limpo!');

    -- Insert dummy product
    insert into marketplace_products (provider_id, title, description, price, active)
    values 
      (test_user_id, 'Cloro Granulado 10kg', 'Ideal para piscinas residenciais.', 150.00, true),
      (test_user_id, 'Kit Limpeza Pesada', 'Vassoura, rodo e produtos concentrados.', 89.90, true);
  end if;
end $$;
