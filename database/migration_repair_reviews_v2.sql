-- REPAIR SCRIPT V2: Drop and recreate reviews table with CORRECT TYPES
-- Fixes error: 42804: foreign key constraint cannot be implemented... incompatible types: uuid and bigint.

DROP TABLE IF EXISTS reviews CASCADE;

create table reviews (
  id uuid default uuid_generate_v4() primary key,
  service_request_id bigint references service_requests(id) on delete cascade, -- CHANGED TO BIGINT due to service_requests.id type
  reviewer_id uuid references profiles(id), -- Resident
  target_id uuid references profiles(id),   -- Professional
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table reviews enable row level security;

-- Policies
create policy "Residents can create reviews" on reviews for insert with check ( auth.uid() = reviewer_id );
create policy "Everyone can view reviews" on reviews for select using ( true );
