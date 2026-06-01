create table if not exists public.babies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  birth_date date,
  preferences text,
  allergies text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists babies_user_id_unique
  on public.babies(user_id);

alter table public.babies enable row level security;

drop policy if exists "Users can view own baby" on public.babies;
drop policy if exists "Users can insert own baby" on public.babies;
drop policy if exists "Users can update own baby" on public.babies;
drop policy if exists "Users can delete own baby" on public.babies;

create policy "Users can view own baby"
  on public.babies for select
  using (auth.uid() = user_id);

create policy "Users can insert own baby"
  on public.babies for insert
  with check (auth.uid() = user_id);

create policy "Users can update own baby"
  on public.babies for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own baby"
  on public.babies for delete
  using (auth.uid() = user_id);
