-- 🛒 PRODUCTS TABLE (Mini-Ecommerce)

create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  vendor_id uuid references public.profiles(id) not null,
  title text not null,
  description text,
  price numeric not null default 0,
  image_url text, -- Store URL from Supabase Storage or external
  category text default 'Outros',
  available boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.products enable row level security;

-- Policy: Anyone can view active products
create policy "Residents can view active products"
  on public.products for select
  using (available = true);

-- Policy: Vendors can manage their own products
create policy "Vendors can manage own products"
  on public.products for all
  using (auth.uid() = vendor_id);

-- STORAGE BUCKET for Product Images (if not exists)
insert into storage.buckets (id, name, public) 
values ('products', 'products', true)
on conflict (id) do nothing;

create policy "Public Access to Product Images"
  on storage.objects for select
  using ( bucket_id = 'products' );

create policy "Vendors Upload Product Images"
  on storage.objects for insert
  with check ( bucket_id = 'products' AND auth.role() = 'authenticated' );
