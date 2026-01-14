-- Create packages table if it doesn't exist
create table if not exists packages (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unit text,
  resident_name text, -- Cache for easier display
  resident_id uuid references auth.users(id),
  description text,
  photo_url text,
  locker text, -- Legacy field, kept for compatibility
  qr_code text unique,
  status text default 'pending', -- 'pending', 'delivered'
  picked_up_at timestamp with time zone,
  picked_up_by uuid references auth.users(id),
  receiver_phone text
);

-- RLS Policies
alter table packages enable row level security;

create policy "Admins can view all packages"
  on packages for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'super_admin', 'porteiro')
    )
  );

create policy "Admins can insert packages"
  on packages for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'super_admin', 'porteiro')
    )
  );

create policy "Admins can update packages"
  on packages for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'super_admin', 'porteiro')
    )
  );

create policy "Residents can view their own packages"
  on packages for select
  using (
    resident_id = auth.uid() OR
    -- Fallback for unit-based matching if resident_id is null
    (resident_id is null AND unit = (select unit from profiles where id = auth.uid()))
  );

create policy "Residents can update (pickup) their own packages"
  on packages for update
  using (
    resident_id = auth.uid() OR
    (resident_id is null AND unit = (select unit from profiles where id = auth.uid()))
  )
  with check (
    status = 'delivered' -- Residents can only mark as delivered
  );
