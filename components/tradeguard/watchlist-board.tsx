"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Loader2,
  Plus,
  Radar,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { PageHeader } from "@/components/tradeguard/workspace-widgets";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { watchlistBadgeConfig } from "@/lib/watchlist/badges";
import { mergeWatchlistWithMarket } from "@/lib/watchlist/entries";
import { fetchMarketAssets } from "@/lib/watchlist/market-client";
import {
  addWatchlistSymbol,
  listWatchlistEntries,
  removeWatchlistSymbol,
} from "@/lib/watchlist/repository";
import type { WatchlistItem } from "@/lib/watchlist/types";
import { formatPercent, formatUsd } from "@/lib/market/market";
import { TRADEGUARD_DISCLAIMER } from "@/lib/tradeguard/disclaimer";
import { cn } from "@/lib/utils";

function changeTone(change: number) {
  if (change > 0) return "text-emerald-300";
  if (change < 0) return "text-red-300";
  return "text-muted-foreground";
}

function WatchlistCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-card/78 p-4">
      <div className="h-4 w-14 rounded bg-muted" />
      <div className="mt-4 h-7 w-24 rounded bg-muted" />
      <div className="mt-2 h-4 w-16 rounded bg-muted" />
    </div>
  );
}

function WatchlistCard({
  item,
  onRemove,
  removing,
}: {
  item: WatchlistItem;
  onRemove: (symbol: string) => void;
  removing: boolean;
}) {
  const badge = watchlistBadgeConfig[item.badge];
  const market = item.market;
  const isUp = (market?.change24h ?? 0) >= 0;
  const ChangeIcon = isUp ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="rounded-xl border-border/80 bg-card/78">
      <CardHeader className="border-b border-border pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="font-mono">{item.symbol}</CardTitle>
            <CardDescription className="truncate">
              {market?.name ?? "Chưa có dữ liệu giá"}
            </CardDescription>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant="outline" className={cn("text-xs", badge.className)}>
              {badge.label}
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Xóa ${item.symbol}`}
              disabled={removing}
              onClick={() => onRemove(item.symbol)}
            >
              {removing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {market ? (
          <>
            <p className="text-2xl font-semibold text-sky-200">{formatUsd(market.price)}</p>
            <div
              className={cn(
                "mt-2 flex items-center gap-1 text-sm font-medium",
                changeTone(market.change24h),
              )}
            >
              <ChangeIcon className="size-4 shrink-0" />
              {formatPercent(market.change24h)}
              <span className="font-normal text-muted-foreground">24h</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Volume 24h: {formatUsd(market.volume24h, true)}
            </p>
          </>
        ) : (
          <p className="text-sm leading-6 text-muted-foreground">
            Symbol chưa có trong phản hồi thị trường hiện tại. Thử làm mới sau vài phút.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function WatchlistBoard() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [symbolInput, setSymbolInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [removingSymbol, setRemovingSymbol] = useState<string | null>(null);

  const loadWatchlist = useCallback(async (options?: { showLoading?: boolean }) => {
    if (options?.showLoading !== false) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);

    const listResult = await listWatchlistEntries();
    if (!listResult.ok) {
      setError(listResult.error);
      setItems([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const symbols = listResult.data.map((entry) => entry.symbol);
    if (symbols.length === 0) {
      setItems([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const marketResult = await fetchMarketAssets(symbols);
    if (!marketResult.ok) {
      setError(marketResult.error);
      setItems(mergeWatchlistWithMarket(listResult.data, []));
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setItems(mergeWatchlistWithMarket(listResult.data, marketResult.assets));
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    let active = true;

    void (async () => {
      const listResult = await listWatchlistEntries();
      if (!active) return;

      if (!listResult.ok) {
        setError(listResult.error);
        setLoading(false);
        return;
      }

      const symbols = listResult.data.map((entry) => entry.symbol);
      if (symbols.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      const marketResult = await fetchMarketAssets(symbols);
      if (!active) return;

      if (!marketResult.ok) {
        setError(marketResult.error);
        setItems(mergeWatchlistWithMarket(listResult.data, []));
      } else {
        setItems(mergeWatchlistWithMarket(listResult.data, marketResult.assets));
      }

      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  const badgeCounts = useMemo(() => {
    return items.reduce(
      (counts, item) => {
        counts[item.badge] += 1;
        return counts;
      },
      { hot: 0, volatile: 0, neutral: 0 },
    );
  }, [items]);

  async function handleAddSymbol(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setIsAdding(true);

    const result = await addWatchlistSymbol(symbolInput);
    if (!result.ok) {
      setFormError(result.error);
      setIsAdding(false);
      return;
    }

    setSymbolInput("");
    setIsAdding(false);
    await loadWatchlist({ showLoading: false });
  }

  async function handleRemoveSymbol(symbol: string) {
    setRemovingSymbol(symbol);
    setFormError(null);

    const result = await removeWatchlistSymbol(symbol);
    if (!result.ok) {
      setFormError(result.error);
      setRemovingSymbol(null);
      return;
    }

    setItems((current) => current.filter((item) => item.symbol !== symbol));
    setRemovingSymbol(null);
  }

  return (
    <>
      <PageHeader
        eyebrow="Watchlist rủi ro"
        title="Theo dõi symbol quan tâm"
        description="Thêm mã coin để xem biến động 24h và nhãn nóng/biến động/ổn định. Dữ liệu giá lấy từ API thị trường công khai."
        action={
          <Button
            variant="outline"
            onClick={() => void loadWatchlist({ showLoading: false })}
            disabled={loading || refreshing}
          >
            <RefreshCw className={cn("size-4", (loading || refreshing) && "animate-spin")} />
            Làm mới
          </Button>
        }
      />

      <Card className="rounded-xl border-border/80 bg-card/78">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-base">Thêm symbol</CardTitle>
          <CardDescription>Ví dụ: BTC, ETH, SOL. Tối đa 24 mã trên watchlist.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleAddSymbol}>
            <Input
              value={symbolInput}
              onChange={(event) => setSymbolInput(event.target.value.toUpperCase())}
              placeholder="Nhập symbol (VD: BTC)"
              className="font-mono uppercase sm:flex-1"
              disabled={isAdding}
              autoComplete="off"
            />
            <Button type="submit" disabled={isAdding} className="w-full sm:w-auto">
              {isAdding ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang thêm...
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  Thêm
                </>
              )}
            </Button>
          </form>
          {formError ? <p className="mt-3 text-sm text-red-300">{formError}</p> : null}
        </CardContent>
      </Card>

      {error ? (
        <Alert className="mt-4 border-red-400/20 bg-red-400/8" variant="destructive">
          <AlertTriangle />
          <AlertTitle>Không tải đủ dữ liệu</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadWatchlist({ showLoading: false })}
              disabled={loading || refreshing}
            >
              Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {items.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline" className={watchlistBadgeConfig.hot.className}>
            Nóng: {badgeCounts.hot}
          </Badge>
          <Badge variant="outline" className={watchlistBadgeConfig.volatile.className}>
            Biến động: {badgeCounts.volatile}
          </Badge>
          <Badge variant="outline" className={watchlistBadgeConfig.neutral.className}>
            Ổn định: {badgeCounts.neutral}
          </Badge>
        </div>
      ) : null}

      {loading ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <WatchlistCardSkeleton key={index} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="mt-4 rounded-xl border-border/80 bg-card/78">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Radar className="size-8 text-muted-foreground" />
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              Watchlist đang trống. Thêm symbol để theo dõi giá và nhãn biến động.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <WatchlistCard
              key={item.id}
              item={item}
              onRemove={(symbol) => void handleRemoveSymbol(symbol)}
              removing={removingSymbol === item.symbol}
            />
          ))}
        </div>
      )}

      <p className="mt-6 text-xs leading-5 text-muted-foreground">{TRADEGUARD_DISCLAIMER}</p>
    </>
  );
}
