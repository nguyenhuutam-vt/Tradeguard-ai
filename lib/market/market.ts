import { clampPercent } from "@/lib/tradeguard/domain";

export type MarketAsset = {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  trendScore: number;
};

export type CoinGeckoMarketRow = {
  symbol?: string;
  name?: string;
  current_price?: number;
  price_change_percentage_24h?: number | null;
  total_volume?: number;
  market_cap?: number;
};

export function computeTrendScore(
  change24h: number,
  volume24h: number,
  maxVolume24h: number,
): number {
  const changeScore = clampPercent(50 + change24h * 2.5);
  const volumeScore = maxVolume24h > 0 ? clampPercent((volume24h / maxVolume24h) * 100) : 0;

  return Math.round(clampPercent(changeScore * 0.65 + volumeScore * 0.35));
}

export function normalizeMarketRows(rows: CoinGeckoMarketRow[]): MarketAsset[] {
  const parsed = rows
    .map((row) => {
      const price = row.current_price;
      const marketCap = row.market_cap;

      if (
        typeof price !== "number" ||
        !Number.isFinite(price) ||
        typeof marketCap !== "number" ||
        !Number.isFinite(marketCap)
      ) {
        return null;
      }

      return {
        symbol: (row.symbol ?? "").toUpperCase(),
        name: row.name ?? row.symbol ?? "Unknown",
        price,
        change24h:
          typeof row.price_change_percentage_24h === "number" &&
          Number.isFinite(row.price_change_percentage_24h)
            ? row.price_change_percentage_24h
            : 0,
        volume24h:
          typeof row.total_volume === "number" && Number.isFinite(row.total_volume)
            ? row.total_volume
            : 0,
        marketCap,
      };
    })
    .filter((row): row is Omit<MarketAsset, "trendScore"> => row !== null);

  const maxVolume24h = Math.max(...parsed.map((row) => row.volume24h), 0);

  return parsed.map((row) => ({
    ...row,
    trendScore: computeTrendScore(row.change24h, row.volume24h, maxVolume24h),
  }));
}

export function formatUsd(value: number, compact = false) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "USD",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: value >= 100 ? 2 : 4,
  }).format(value);
}

export function formatPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}
