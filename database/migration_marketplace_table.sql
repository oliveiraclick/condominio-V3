-- Create marketplace table
create table if not exists public.marketplace (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references public.profiles(id) not null,
  title text not null,
  price numeric not null,
  status text not null default 'USADO',
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.marketplace enable row level security;

-- Policies

-- Everyone can view
create policy "Anyone can view marketplace items"
  on public.marketplace for select
  using (true);

-- Residents can insert their own items
create policy "Residents can insert their own items"
  on public.marketplace for insert
  with check (auth.uid() = seller_id);

-- Owners and Admins can update/delete
create policy "Users can update own items"
  on public.marketplace for update
  using (auth.uid() = seller_id OR exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin')));

create policy "Users can delete own items"
  on public.marketplace for delete
  using (auth.uid() = seller_id OR exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin')));
