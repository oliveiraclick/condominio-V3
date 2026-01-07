-- Trigger to automatically create profile AND professional services (if applicable)
-- This replaces the previous simple trigger to handle all fields and roles.

create or replace function public.handle_new_user_full()
returns trigger as $$
declare
  is_professional boolean;
begin
  -- 1. Create Profile
  insert into public.profiles (
    id, 
    email, 
    name, 
    role, 
    cpf, 
    rg, 
    phone, 
    tower, 
    unit, 
    spouse_name,
    created_at
  )
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'resident'),
    new.raw_user_meta_data->>'cpf',
    new.raw_user_meta_data->>'rg',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'tower',
    new.raw_user_meta_data->>'unit',
    new.raw_user_meta_data->>'spouse_name',
    now()
  );

  -- 2. Create Professional Service entry if role is professional
  is_professional := (new.raw_user_meta_data->>'role' = 'professional');
  
  if is_professional then
    insert into public.professional_services (
      provider_id,
      title,
      category,
      description,
      active
    )
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name', 'Novo Profissional'), -- Use name as default title
      coalesce(new.raw_user_meta_data->>'category', 'Outros'),
      'Prestador de serviços cadastrado.',
      true
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Drop previous trigger to avoid conflicts
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user_full();
