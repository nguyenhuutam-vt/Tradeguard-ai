-- Legacy installs created public.trades without exit_price.
-- Backfill from entry_price so existing rows stay valid.

alter table public.trades
  add column if not exists exit_price numeric;

update public.trades
set exit_price = entry_price
where exit_price is null;

alter table public.trades
  alter column exit_price set not null;

alter table public.trades
  drop constraint if exists trades_exit_price_positive;

alter table public.trades
  add constraint trades_exit_price_positive check (exit_price > 0);
