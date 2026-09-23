create extension if not exists pgcrypto;

create type public.transaction_type as enum ('income', 'expense');

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type public.transaction_type not null,
  amount numeric(12, 2) not null check (amount > 0),
  description text not null
    check (char_length(btrim(description)) between 1 and 200),
  transaction_date date not null default current_date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index transactions_user_date_idx
  on public.transactions (user_id, transaction_date desc, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger transactions_set_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

alter table public.transactions enable row level security;

create policy "transactions_select_own"
on public.transactions
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "transactions_insert_own"
on public.transactions
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "transactions_update_own"
on public.transactions
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "transactions_delete_own"
on public.transactions
for delete to authenticated
using ((select auth.uid()) = user_id);
