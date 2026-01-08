-- Create reviews table to store service ratings
create table if not exists reviews (
  id uuid default uuid_generate_v4() primary key,
  service_request_id uuid references service_requests(id) on delete cascade,
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

-- Add trigger to update professional rating (avg) on new review? 
-- For simplicity, we can calculate avg on read or use a view/function later.
