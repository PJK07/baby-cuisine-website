-- Follow-up to 20260525000000_init_schema.sql
-- Adds: order status lifecycle, updated_at auto-tracking, and admin access.

-- 1. Shared trigger to keep updated_at current on any UPDATE -----------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2. orders.updated_at + auto-update trigger ---------------------------------
alter table public.orders
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- Also enforce it on contacts (currently set by app code only)
drop trigger if exists contacts_set_updated_at on public.contacts;
create trigger contacts_set_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

-- 3. Constrain status to a known set ----------------------------------------
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders
  add constraint orders_status_check
  check (status in (
    'whatsapp_sent',
    'confirmed',
    'preparing',
    'out_for_delivery',
    'delivered',
    'cancelled'
  ));

-- 4. Admins table + helper ---------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- SECURITY DEFINER so the membership check bypasses RLS on admins itself,
-- avoiding infinite recursion when used inside other tables' policies.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

-- Admins can see the admin roster. Inserts/removals are intentionally left to
-- the service role / dashboard only (no client write policy).
drop policy if exists "Admins can view admins" on public.admins;
create policy "Admins can view admins"
  on public.admins for select
  using (public.is_admin());

-- 5. Admin access to orders & contacts --------------------------------------
-- These are additional permissive policies; they OR with the existing
-- "Users can view their own ..." policies.
drop policy if exists "Admins can view all orders" on public.orders;
create policy "Admins can view all orders"
  on public.orders for select
  using (public.is_admin());

drop policy if exists "Admins can update all orders" on public.orders;
create policy "Admins can update all orders"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can view all contacts" on public.contacts;
create policy "Admins can view all contacts"
  on public.contacts for select
  using (public.is_admin());

-- To grant yourself admin (run once, e.g. in the SQL editor):
--   insert into public.admins (user_id) values ('<your-auth-user-id>');
