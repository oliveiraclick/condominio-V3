-- Trigger to automatically create a profile entry when a new user signs up via Supabase Auth.
-- This is necessary if Email Configuration is enabled, because the frontend cannot write to the 'profiles' table without an active session.

-- 1. Create the function that the trigger will call
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role, created_at)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name', -- Extract name from metadata
    coalesce(new.raw_user_meta_data->>'role', 'resident'), -- Default to resident, or use metadata
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. Create the trigger on auth.users
-- Drop if exists to avoid errors on multiple runs
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Usage: Run this in the Supabase SQL Editor.
