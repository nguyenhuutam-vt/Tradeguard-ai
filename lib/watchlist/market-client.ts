import type { MarketAsset } from "@/lib/market/market";

type MarketResponse = {
  assets: MarketAsset[];
  updatedAt: string;
};

export async function fetchMarketAssets(
  symbols?: readonly string[],
): Promise<{ ok: true; assets: MarketAsset[] } | { ok: false; error: string }> {
  try {
    const query =
      symbols && symbols.length > 0 ? `?symbols=${encodeURIComponent(symbols.join(","))}` : "";

    const response = await fetch(`/api/market${query}`);
    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      let apiError: string | null = null;
      if (payload && typeof payload === "object" && "error" in payload) {
        const value = Reflect.get(payload, "error");
        if (typeof value === "string") {
          apiError = value;
        }
      }
      return {
        ok: false,
        error: apiError ?? "Không thể tải dữ liệu giá",
      };
    }

    const data = payload as MarketResponse;
    return { ok: true, assets: data.assets };
  } catch {
    return {
      ok: false,
      error: "Không thể tải dữ liệu giá",
    };
  }
}
