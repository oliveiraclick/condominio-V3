create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.push_subscriptions enable row level security;

-- Policies
drop policy if exists "Users can assert their own subscriptions" on public.push_subscriptions;
create policy "Users can assert their own subscriptions"
  on public.push_subscriptions
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can view their own subscriptions" on public.push_subscriptions;
create policy "Users can view their own subscriptions"
  on public.push_subscriptions
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own subscriptions" on public.push_subscriptions;
create policy "Users can delete their own subscriptions"
  on public.push_subscriptions
  for delete
  using (auth.uid() = user_id);
  
-- Service Role can view all (for Edge Function)
-- (Implicitly true for service_role, but explicit for authenticated superadmins if needed)

-- Index for performance (optional for small volume)
create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions(user_id);
