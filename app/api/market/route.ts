import { NextResponse } from "next/server";

import { normalizeMarketRows, type CoinGeckoMarketRow } from "@/lib/market/market";

const COINGECKO_BASE =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&sparkline=false";

function buildCoinGeckoUrl(symbols: string[] | null) {
  if (symbols && symbols.length > 0) {
    const params = new URLSearchParams({
      vs_currency: "usd",
      sparkline: "false",
      per_page: "250",
      page: "1",
      symbols: symbols.join(","),
    });
    return `https://api.coingecko.com/api/v3/coins/markets?${params.toString()}`;
  }

  const params = new URLSearchParams({
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: "12",
    page: "1",
    sparkline: "false",
  });
  return `${COINGECKO_BASE.split("?")[0]}?${params.toString()}`;
}

function parseSymbolsParam(value: string | null): string[] | null {
  if (!value) {
    return null;
  }

  const symbols = value
    .split(",")
    .map((symbol) => symbol.trim().toLowerCase())
    .filter((symbol) => /^[a-z0-9]{1,24}$/.test(symbol));

  return symbols.length > 0 ? [...new Set(symbols)] : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = parseSymbolsParam(searchParams.get("symbols"));

  try {
    const response = await fetch(buildCoinGeckoUrl(symbols), {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      console.error("[market] CoinGecko request failed", {
        status: response.status,
      });
      return NextResponse.json({ error: "Failed to fetch market data" }, { status: 502 });
    }

    const payload: unknown = await response.json();

    if (!Array.isArray(payload)) {
      console.error("[market] Unexpected CoinGecko payload shape");
      return NextResponse.json({ error: "Invalid market data response" }, { status: 502 });
    }

    let assets = normalizeMarketRows(payload as CoinGeckoMarketRow[]);

    if (symbols) {
      const allowed = new Set(symbols.map((symbol) => symbol.toUpperCase()));
      assets = assets.filter((asset) => allowed.has(asset.symbol));
    }

    if (assets.length === 0 && !symbols) {
      return NextResponse.json({ error: "No market data available" }, { status: 502 });
    }

    return NextResponse.json({
      assets,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === "TimeoutError";

    console.error("[market] Unexpected error", error);

    return NextResponse.json(
      {
        error: isTimeout ? "Market data request timed out" : "Failed to fetch market data",
      },
      { status: isTimeout ? 504 : 500 },
    );
  }
}
