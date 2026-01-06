-- Service Categories and Offerings (Marketplace)
create table professional_services (
  id uuid default uuid_generate_v4() primary key,
  provider_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  category text, -- Eletricista, Encanador, etc.
  description text,
  price_range text,
  rating numeric default 5.0,
  reviews_count integer default 0,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Service Requests (Chamados / Contratações)
create table service_requests (
  id uuid default uuid_generate_v4() primary key,
  resident_id uuid references profiles(id) not null,
  service_id uuid references professional_services(id), -- Optional, can be a general request
  category text,
  title text not null,
  description text,
  status text default 'pending', -- pending, accepted, completed, rejected
  provider_id uuid references profiles(id), -- Who accepted it
  scheduled_date timestamp with time zone,
  location text, -- Unit/Block
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table professional_services enable row level security;
alter table service_requests enable row level security;

create policy "Public services viewable by everyone" on professional_services for select using ( true );
create policy "Providers can manage their services" on professional_services for all using ( auth.uid() = provider_id );

create policy "Residents can see their own requests" on service_requests for select using ( auth.uid() = resident_id );
create policy "Providers can see requests assigned to them or open" on service_requests for select using ( 
  auth.uid() = provider_id or (status = 'pending') -- Simplification: all providers see pending? Or maybe filtered by category later.
);
create policy "Residents can insert requests" on service_requests for insert with check ( auth.uid() = resident_id );
create policy "Providers can update assigned requests" on service_requests for update using ( auth.uid() = provider_id );
