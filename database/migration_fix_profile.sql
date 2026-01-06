-- Create condominiums table
create table condominiums (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  address text,
  plan text default 'basic',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add condominium_id to profiles
alter table profiles 
add column condominium_id uuid references condominiums(id);

-- Enable RLS
alter table condominiums enable row level security;
create policy "Condominiums viewable by everyone" on condominiums for select using ( true );

-- Seed default condominium
insert into condominiums (name, address, plan)
values ('Vila Verde Residence', 'Rua das Flores, 123', 'pro');

-- Update existing profiles to belong to the new default condominium
do $$
declare
  default_condo_id uuid;
begin
  select id into default_condo_id from condominiums limit 1;
  update profiles set condominium_id = default_condo_id where condominium_id is null;
end $$;
