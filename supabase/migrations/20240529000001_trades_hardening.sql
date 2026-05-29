-- Align DB constraints with app validation (defense in depth with RLS).

alter table public.trades
  add constraint trades_symbol_format
  check (symbol ~ '^[A-Z0-9]{1,24}$');

alter table public.trades
  add constraint trades_emotion_allowed
  check (
    emotion in (
      'Bình tĩnh',
      'FOMO',
      'Sợ hãi',
      'Tự tin',
      'Tham lam',
      'Trả thù thị trường',
      'Mệt mỏi'
    )
  );
