import type { MarketAsset } from "@/lib/market/market";
import { getWatchlistBadge } from "@/lib/watchlist/badges";
import type { WatchlistEntry, WatchlistItem, WatchlistRow } from "@/lib/watchlist/types";

export function mapWatchlistRow(row: WatchlistRow, expectedUserId?: string): WatchlistEntry | null {
  if (expectedUserId && row.user_id !== expectedUserId) {
    return null;
  }

  if (!/^[A-Z0-9]{1,24}$/.test(row.symbol)) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    symbol: row.symbol,
    createdAt: row.created_at,
  };
}

export function parseWatchlistRows(rows: unknown, expectedUserId?: string): WatchlistEntry[] {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .filter((row): row is WatchlistRow => {
      if (!row || typeof row !== "object") {
        return false;
      }

      const record = row as Record<string, unknown>;
      return (
        typeof record.id === "string" &&
        typeof record.user_id === "string" &&
        typeof record.symbol === "string" &&
        typeof record.created_at === "string"
      );
    })
    .map((row) => mapWatchlistRow(row, expectedUserId))
    .filter((entry): entry is WatchlistEntry => entry !== null);
}

export function mergeWatchlistWithMarket(
  entries: readonly WatchlistEntry[],
  marketAssets: readonly MarketAsset[],
): WatchlistItem[] {
  const marketBySymbol = new Map(marketAssets.map((asset) => [asset.symbol.toUpperCase(), asset]));

  return entries.map((entry) => {
    const market = marketBySymbol.get(entry.symbol) ?? null;
    const change24h = market?.change24h ?? 0;

    return {
      ...entry,
      market,
      badge: getWatchlistBadge(change24h),
    };
  });
}
