"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, RefreshCw, TrendingUp } from "lucide-react";

import { PageHeader, RiskBar } from "@/components/tradeguard/workspace-widgets";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPercent, formatUsd, type MarketAsset } from "@/lib/market/market";
import { TRADEGUARD_DISCLAIMER } from "@/lib/tradeguard/disclaimer";
import { cn } from "@/lib/utils";

type MarketResponse = {
  assets: MarketAsset[];
  updatedAt: string;
};

function trendTone(score: number): "good" | "warn" | "danger" | "info" {
  if (score >= 65) return "good";
  if (score >= 45) return "info";
  if (score >= 30) return "warn";
  return "danger";
}

function changeTone(change: number): string {
  if (change > 0) return "text-emerald-300";
  if (change < 0) return "text-red-300";
  return "text-muted-foreground";
}

function MarketCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-border bg-card/78 p-4">
      <div className="h-4 w-16 rounded bg-muted" />
      <div className="mt-4 h-8 w-28 rounded bg-muted" />
      <div className="mt-3 h-3 w-full rounded bg-muted" />
      <div className="mt-2 h-2 w-full rounded bg-muted" />
    </div>
  );
}

function MarketAssetCard({ asset }: { asset: MarketAsset }) {
  const isUp = asset.change24h >= 0;
  const ChangeIcon = isUp ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="rounded-xl border-border/80 bg-card/78">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-mono text-sm font-medium">{asset.symbol}</p>
            <p className="text-xs text-muted-foreground">{asset.name}</p>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {asset.trendScore}
          </Badge>
        </div>
        <p className="mt-4 text-2xl font-semibold text-sky-200">{formatUsd(asset.price)}</p>
        <div
          className={cn(
            "mt-2 flex items-center gap-1 text-sm font-medium",
            changeTone(asset.change24h),
          )}
        >
          <ChangeIcon className="size-4" />
          {formatPercent(asset.change24h)}
          <span className="text-muted-foreground font-normal">24h</span>
        </div>
        <div className="mt-4">
          <RiskBar
            label="Trend score"
            value={asset.trendScore}
            tone={trendTone(asset.trendScore)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function MarketTableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex animate-pulse gap-4 border-b border-border/50 pb-3">
          <div className="h-4 w-12 rounded bg-muted" />
          <div className="h-4 flex-1 rounded bg-muted" />
          <div className="h-4 w-20 rounded bg-muted" />
          <div className="h-4 w-16 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function MarketDashboard() {
  const [assets, setAssets] = useState<MarketAsset[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMarket = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/market");
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        let apiError: string | null = null;
        if (payload && typeof payload === "object" && "error" in payload) {
          const value = Reflect.get(payload, "error");
          if (typeof value === "string") {
            apiError = value;
          }
        }
        throw new Error(apiError ?? "Không thể tải dữ liệu thị trường");
      }

      const data = payload as MarketResponse;
      setAssets(data.assets);
      setUpdatedAt(data.updatedAt);
    } catch (fetchError) {
      setAssets([]);
      setUpdatedAt(null);
      setError(
        fetchError instanceof Error ? fetchError.message : "Không thể tải dữ liệu thị trường",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const response = await fetch("/api/market");
        const payload: unknown = await response.json().catch(() => null);

        if (!active) {
          return;
        }

        if (!response.ok) {
          let apiError: string | null = null;
          if (payload && typeof payload === "object" && "error" in payload) {
            const value = Reflect.get(payload, "error");
            if (typeof value === "string") {
              apiError = value;
            }
          }
          throw new Error(apiError ?? "Không thể tải dữ liệu thị trường");
        }

        const data = payload as MarketResponse;
        setAssets(data.assets);
        setUpdatedAt(data.updatedAt);
        setError(null);
      } catch (fetchError) {
        if (!active) {
          return;
        }

        setAssets([]);
        setUpdatedAt(null);
        setError(
          fetchError instanceof Error ? fetchError.message : "Không thể tải dữ liệu thị trường",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const featured = assets.slice(0, 4);
  const avgTrend =
    assets.length > 0
      ? Math.round(assets.reduce((sum, asset) => sum + asset.trendScore, 0) / assets.length)
      : null;

  return (
    <>
      <PageHeader
        eyebrow="Thị trường crypto"
        title="Bảng giá top coin"
        description="Theo dõi biến động 24h, thanh khoản và điểm xu hướng tham khảo. Không phải tín hiệu giao dịch."
        action={
          <Button variant="outline" onClick={() => void loadMarket()} disabled={loading}>
            <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            Làm mới
          </Button>
        }
      />

      {error ? (
        <Alert className="mb-4 border-red-400/20 bg-red-400/8" variant="destructive">
          <AlertTriangle />
          <AlertTitle>Không tải được dữ liệu</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadMarket()}
              disabled={loading}
            >
              Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {loading && assets.length === 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <MarketCardSkeleton key={index} />
          ))}
        </div>
      ) : featured.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featured.map((asset) => (
            <MarketAssetCard key={asset.symbol} asset={asset} />
          ))}
        </div>
      ) : null}

      {!loading && assets.length > 0 ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Card className="rounded-xl border-border/80 bg-card/78 lg:col-span-1">
            <CardHeader className="border-b border-border">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-5 text-primary" />
                <CardTitle className="text-base">Tổng quan thị trường</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <p className="text-sm text-muted-foreground">Trend score trung bình</p>
                <p className="mt-1 text-3xl font-semibold text-sky-200">{avgTrend ?? "—"}/100</p>
              </div>
              {avgTrend !== null ? (
                <RiskBar label="Nhiệt độ tham khảo" value={avgTrend} tone={trendTone(avgTrend)} />
              ) : null}
              <p className="text-xs leading-5 text-muted-foreground">
                Điểm xu hướng kết hợp % thay đổi 24h (65%) và khối lượng tương đối (35%). Chỉ để
                tham khảo rủi ro/biến động.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border/80 bg-card/78 lg:col-span-2">
            <CardHeader className="border-b border-border">
              <CardTitle>Bảng giá</CardTitle>
              <CardDescription>
                Top {assets.length} theo vốn hóa
                {updatedAt ? ` · Cập nhật ${new Date(updatedAt).toLocaleString("vi-VN")}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead className="hidden sm:table-cell">Tên</TableHead>
                    <TableHead className="text-right">Giá</TableHead>
                    <TableHead className="text-right">24h</TableHead>
                    <TableHead className="hidden text-right md:table-cell">Volume</TableHead>
                    <TableHead className="hidden text-right lg:table-cell">Vốn hóa</TableHead>
                    <TableHead className="text-right">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.symbol}>
                      <TableCell className="font-mono font-medium">{asset.symbol}</TableCell>
                      <TableCell className="hidden max-w-[140px] truncate sm:table-cell text-muted-foreground">
                        {asset.name}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatUsd(asset.price)}
                      </TableCell>
                      <TableCell
                        className={cn("text-right font-medium", changeTone(asset.change24h))}
                      >
                        {formatPercent(asset.change24h)}
                      </TableCell>
                      <TableCell className="hidden text-right md:table-cell">
                        {formatUsd(asset.volume24h, true)}
                      </TableCell>
                      <TableCell className="hidden text-right lg:table-cell">
                        {formatUsd(asset.marketCap, true)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-mono",
                            asset.trendScore >= 65 && "border-emerald-400/30 text-emerald-200",
                            asset.trendScore < 65 &&
                              asset.trendScore >= 45 &&
                              "border-sky-400/30 text-sky-200",
                            asset.trendScore < 45 &&
                              asset.trendScore >= 30 &&
                              "border-amber-400/30 text-amber-200",
                            asset.trendScore < 30 && "border-red-400/30 text-red-200",
                          )}
                        >
                          {asset.trendScore}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ) : loading ? (
        <Card className="mt-4 rounded-xl border-border/80 bg-card/78">
          <CardHeader className="border-b border-border">
            <CardTitle>Bảng giá</CardTitle>
          </CardHeader>
          <MarketTableSkeleton />
        </Card>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-muted-foreground">{TRADEGUARD_DISCLAIMER}</p>
    </>
  );
}
