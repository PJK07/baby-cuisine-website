create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  phone text not null,
  address text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_email text not null,
  customer_name text not null,
  customer_phone text not null,
  delivery_address text not null,
  delivery_day text not null check (delivery_day in ('Tuesday', 'Friday')),
  order_notes text,
  items jsonb not null,
  total_amount numeric(10, 2) not null,
  status text not null default 'whatsapp_sent',
  created_at timestamptz not null default now()
);

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

alter table public.contacts enable row level security;
alter table public.orders enable row level security;
alter table public.babies enable row level security;

drop policy if exists "Users can view their own contact" on public.contacts;
drop policy if exists "Users can create their own contact" on public.contacts;
drop policy if exists "Users can update their own contact" on public.contacts;
drop policy if exists "Users can view their own orders" on public.orders;
drop policy if exists "Users can create their own orders" on public.orders;
drop policy if exists "Users can view own baby" on public.babies;
drop policy if exists "Users can insert own baby" on public.babies;
drop policy if exists "Users can update own baby" on public.babies;
drop policy if exists "Users can delete own baby" on public.babies;

create policy "Users can view their own contact"
  on public.contacts for select
  using (auth.uid() = user_id);

create policy "Users can create their own contact"
  on public.contacts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own contact"
  on public.contacts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can create their own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

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

create index if not exists contacts_user_id_idx on public.contacts(user_id);
create index if not exists orders_user_id_created_at_idx on public.orders(user_id, created_at desc);
create unique index if not exists babies_user_id_unique on public.babies(user_id);
