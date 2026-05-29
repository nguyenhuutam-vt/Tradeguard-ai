-- Per-user crypto watchlist symbols.

create table if not exists public.watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  symbol text not null,
  created_at timestamptz not null default now(),
  constraint watchlists_user_symbol_unique unique (user_id, symbol),
  constraint watchlists_symbol_format check (symbol ~ '^[A-Z0-9]{1,24}$')
);

create index if not exists watchlists_user_id_created_at_idx
  on public.watchlists (user_id, created_at desc);

alter table public.watchlists enable row level security;

create policy "Users can read own watchlist"
  on public.watchlists
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own watchlist"
  on public.watchlists
  for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own watchlist"
  on public.watchlists
  for delete
  using (auth.uid() = user_id);
