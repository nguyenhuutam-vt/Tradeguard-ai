import type { MarketAsset } from "@/lib/market/market";
import type { WatchlistsRow } from "@/lib/supabase/database";

export type WatchlistBadge = "hot" | "volatile" | "neutral";

export type WatchlistEntry = {
  id: string;
  userId: string;
  symbol: string;
  createdAt: string;
};

export type WatchlistRow = WatchlistsRow;

export type WatchlistItem = WatchlistEntry & {
  market: MarketAsset | null;
  badge: WatchlistBadge;
};
