-- Trading journal: one row per closed trade for the authenticated user.

create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  symbol text not null,
  direction text not null check (direction in ('long', 'short')),
  entry_price numeric not null check (entry_price > 0),
  exit_price numeric not null check (exit_price > 0),
  leverage numeric not null check (leverage > 0 and leverage <= 125),
  result_pnl numeric not null,
  emotion text not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists trades_user_id_created_at_idx
  on public.trades (user_id, created_at desc);

alter table public.trades enable row level security;

create policy "Users can read own trades"
  on public.trades
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own trades"
  on public.trades
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own trades"
  on public.trades
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own trades"
  on public.trades
  for delete
  using (auth.uid() = user_id);
