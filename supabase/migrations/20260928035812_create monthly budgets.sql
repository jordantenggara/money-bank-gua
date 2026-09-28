create table public.monthly_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  budget_month date not null check (extract(day from budget_month) = 1),
  amount numeric(12, 2) not null check (amount > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint monthly_budgets_user_month_key unique (user_id, budget_month)
);

create index monthly_budgets_user_month_idx
  on public.monthly_budgets (user_id, budget_month desc);

create trigger monthly_budgets_set_updated_at
before update on public.monthly_budgets
for each row execute function public.set_updated_at();

alter table public.monthly_budgets enable row level security;

create policy "monthly_budgets_select_own"
on public.monthly_budgets
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "monthly_budgets_insert_own"
on public.monthly_budgets
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "monthly_budgets_update_own"
on public.monthly_budgets
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "monthly_budgets_delete_own"
on public.monthly_budgets
for delete to authenticated
using ((select auth.uid()) = user_id);