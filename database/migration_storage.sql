-- Create a public bucket for products if it doesn't exist
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- Safely drop existing policies to avoid conflicts
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated users can upload" on storage.objects;
drop policy if exists "Users can update own files" on storage.objects;
drop policy if exists "Users can delete own files" on storage.objects;

-- Allow public access to view files
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'products' );

-- Allow authenticated users to upload files
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check ( bucket_id = 'products' and auth.role() = 'authenticated' );

-- Allow users to update/delete their own files
create policy "Users can update own files"
  on storage.objects for update
  using ( bucket_id = 'products' and auth.uid() = owner );

create policy "Users can delete own files"
  on storage.objects for delete
  using ( bucket_id = 'products' and auth.uid() = owner );
