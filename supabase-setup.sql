-- Run this whole file once in your Supabase project's SQL editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run).
-- It creates the tables Paisa Buddy needs, and locks each row to its
-- owning user with Row Level Security so users can never see each other's data.

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('expense','income')),
  date date not null,
  category text not null,
  note text default '',
  amount numeric not null,
  created_at timestamptz default now()
);

create table if not exists public.budgets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  amount numeric not null default 0
);

create table if not exists public.custom_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('expense','income')),
  cat_id text not null,
  ml text not null,
  en text not null,
  color text not null,
  unique (user_id, type, cat_id)
);

alter table public.expenses enable row level security;
alter table public.budgets enable row level security;
alter table public.custom_categories enable row level security;

create policy "expenses_owner_only" on public.expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "budgets_owner_only" on public.budgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "custom_categories_owner_only" on public.custom_categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---- Payment-gated access ----
-- New signups land here as 'pending' until you (the admin) manually flip
-- their row to 'approved' in the Supabase Table Editor after confirming
-- you received their GPay/UPI payment. Users can INSERT and SELECT their
-- own requests, but cannot UPDATE the status themselves — only you can,
-- via the dashboard (which bypasses RLS since you're the project owner).
create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  email text not null,
  transaction_ref text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

alter table public.access_requests enable row level security;

create policy "access_requests_insert_own" on public.access_requests
  for insert with check (auth.uid() = user_id);

create policy "access_requests_select_own" on public.access_requests
  for select using (auth.uid() = user_id);

-- Note: intentionally no UPDATE/DELETE policy for regular users —
-- approval status can only be changed from the Supabase dashboard.
