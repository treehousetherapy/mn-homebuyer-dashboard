-- Run this in your Supabase SQL editor to set up all tables

-- User profiles (persists the buyer profile form data)
create table if not exists user_profiles (
  id uuid references auth.users primary key,
  annual_income numeric,
  credit_score int,
  is_first_gen boolean default false,
  target_city text,
  monthly_debt numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table user_profiles enable row level security;
create policy "Users can manage own profile" on user_profiles
  for all using (auth.uid() = id);

-- DPA waitlist (email alerts when First-Gen DPA portal reopens)
create table if not exists dpa_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  phone text,
  first_gen boolean default true,
  income numeric,
  notified boolean default false,
  enrolled_at timestamptz default now()
);
-- Only server-side (service role) can insert/read waitlist — no RLS user policy
alter table dpa_waitlist enable row level security;
create policy "Service role only" on dpa_waitlist
  for all using (auth.role() = 'service_role');
-- Allow anonymous inserts for waitlist signup (unauthenticated users can sign up)
create policy "Anyone can join waitlist" on dpa_waitlist
  for insert with check (true);
