import type { WatchlistBadge } from "@/lib/watchlist/types";

const VOLATILE_THRESHOLD = 8;
const HOT_THRESHOLD = 5;

export function getWatchlistBadge(change24h: number): WatchlistBadge {
  if (Math.abs(change24h) >= VOLATILE_THRESHOLD) {
    return "volatile";
  }

  if (change24h >= HOT_THRESHOLD) {
    return "hot";
  }

  return "neutral";
}

export const watchlistBadgeConfig: Record<WatchlistBadge, { label: string; className: string }> = {
  hot: {
    label: "Nóng",
    className: "border-orange-400/35 bg-orange-400/10 text-orange-200",
  },
  volatile: {
    label: "Biến động",
    className: "border-red-400/35 bg-red-400/10 text-red-200",
  },
  neutral: {
    label: "Ổn định",
    className: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  },
};
