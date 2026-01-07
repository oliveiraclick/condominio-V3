-- Create table if not exists
create table if not exists public.condominiums (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.condominiums enable row level security;

-- Drop existing policies
drop policy if exists "Authenticated users can select condominiums" on public.condominiums;
drop policy if exists "Public can select condominiums" on public.condominiums;

-- Create policies
create policy "Authenticated users can select condominiums"
  on public.condominiums for select
  to authenticated
  using (true);

create policy "Public can select condominiums"
  on public.condominiums for select
  to anon
  using (true);
