-- WARNING: This will delete existing data in these tables.
-- Run this if you want to ensuring the database matches the application schema exactly.

-- Drop existing tables if they exist
drop table if exists reservations cascade;
drop table if exists common_areas cascade;
drop table if exists dependents cascade;
drop table if exists profiles cascade;

-- Create tables
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  name text,
  role text default 'resident',
  cpf text,
  rg text,
  phone text,
  tower text,
  unit text,
  spouse_name text,
  is_free boolean default false,
  avatar text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table dependents (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  kinship text,
  birth_date text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Common Areas for reservations
create table common_areas (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  icon text,
  price text,
  hours text,
  inventory text,
  photos text[],
  category text, 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Reservations
create table reservations (
  id uuid default uuid_generate_v4() primary key,
  area_id uuid references common_areas(id),
  profile_id uuid references profiles(id),
  date date not null,
  status text default 'confirmed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table profiles enable row level security;
alter table dependents enable row level security;
alter table common_areas enable row level security;
alter table reservations enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

-- Policies for Dependents
create policy "Dependents viewable by owner" on dependents for select using ( auth.uid() = profile_id );
create policy "Dependents insertable by owner" on dependents for insert with check ( auth.uid() = profile_id );

-- Policies for Common Areas
create policy "Common areas viewable by everyone" on common_areas for select using ( true );
create policy "Common areas editable by admin" on common_areas for all using ( 
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Policies for Reservations
create policy "Reservations viewable by everyone" on reservations for select using ( true );
create policy "Users can insert reservations" on reservations for insert with check ( auth.uid() = profile_id );
