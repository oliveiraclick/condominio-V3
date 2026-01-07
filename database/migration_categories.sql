-- Create categories table
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  image_url text,
  type text default 'product', -- 'product' or 'service'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table public.categories enable row level security;

-- Policies
create policy "Anyone can view categories"
  on public.categories for select
  using (true);

create policy "Admins can insert categories"
  on public.categories for insert
  with check (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Admins can update categories"
  on public.categories for update
  using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Admins can delete categories"
  on public.categories for delete
  using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- Initial Data
insert into public.categories (name, image_url, type) values
('Alimentação', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', 'product'),
('Manutenção', 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80', 'service'),
('Limpeza', 'https://images.unsplash.com/photo-1581578731117-104f2a8d23e9?auto=format&fit=crop&w=800&q=80', 'service'),
('Estética', 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=800&q=80', 'service'),
('Outros', 'https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&w=800&q=80', 'product'),
('Roupas', 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80', 'product');

-- Storage Bucket for Categories
insert into storage.buckets (id, name, public) 
values ('categories', 'categories', true), ('marketplace', 'marketplace', true)
on conflict (id) do nothing;

create policy "Categories images are public"
  on storage.objects for select
  using ( bucket_id = 'categories' );

create policy "Marketplace images are public"
  on storage.objects for select
  using ( bucket_id = 'marketplace' );

create policy "Admins can upload category images"
  on storage.objects for insert
  with check (
    bucket_id = 'categories' AND
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Residents can upload marketplace images"
  on storage.objects for insert
  with check (
    bucket_id = 'marketplace' AND
    exists (select 1 from profiles where id = auth.uid())
  );
