-- Add subscription fields to profiles
alter table profiles 
add column subscription_status text default 'trial', -- 'trial', 'active', 'expired', 'cancelled'
add column trial_ends_at timestamp with time zone default (now() + interval '60 days'),
add column plan_id text default 'pro_monthly_29';

-- Update existing professionals to have a trial period starting now
update profiles 
set trial_ends_at = (now() + interval '60 days')
where role = 'professional' and trial_ends_at is null;

-- RLS (update existing policies if needed, but usually users can view their own profile)
-- Ensure Admins/SuperAdmins can update these fields (already handled by role privileges usually, or need policy update)

create policy "Super Admins can update any profile subscription"
  on profiles for update
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'super_admin'
    )
  );
