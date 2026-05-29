"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Calculator, ShieldAlert } from "lucide-react";

import { MetricCard, PageHeader } from "@/components/tradeguard/workspace-widgets";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculateTrade,
  type TradeAnalysis,
  type TradeDirection,
} from "@/lib/trading/calculate-trade";
import { TRADEGUARD_DISCLAIMER } from "@/lib/tradeguard/disclaimer";
import { cn } from "@/lib/utils";

type FormState = {
  symbol: string;
  direction: TradeDirection;
  margin: string;
  leverage: string;
  entryPrice: string;
  stopLoss: string;
  takeProfit: string;
};

const defaultForm: FormState = {
  symbol: "BTC",
  direction: "long",
  margin: "100",
  leverage: "10",
  entryPrice: "65000",
  stopLoss: "63000",
  takeProfit: "70000",
};

const riskLevelConfig = {
  low: {
    label: "Thấp",
    badgeClass: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  },
  medium: {
    label: "Trung bình",
    badgeClass: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  },
  high: {
    label: "Cao",
    badgeClass: "border-orange-400/30 bg-orange-400/10 text-orange-200",
  },
  extreme: {
    label: "Cực cao",
    badgeClass: "border-red-400/30 bg-red-400/10 text-red-200",
  },
} as const;

function parsePositive(value: string): number | undefined {
  const parsed = Number(value.replace(/,/g, "").trim());
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }
  return parsed;
}

function formatUsdt(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: value >= 1000 ? 2 : 4,
  }).format(value);
}

function formatRatio(value: number) {
  return `1 : ${value.toFixed(2)}`;
}

function analyzeForm(form: FormState): TradeAnalysis | null {
  const margin = parsePositive(form.margin);
  const leverage = parsePositive(form.leverage);
  const entryPrice = parsePositive(form.entryPrice);

  if (!margin || !leverage || !entryPrice) {
    return null;
  }

  const stopLoss = parsePositive(form.stopLoss);
  const takeProfit = parsePositive(form.takeProfit);

  return calculateTrade({
    direction: form.direction,
    margin,
    leverage,
    entryPrice,
    stopLoss,
    takeProfit,
  });
}

function DirectionToggle({
  direction,
  onChange,
}: {
  direction: TradeDirection;
  onChange: (direction: TradeDirection) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/40 p-1">
      <button
        type="button"
        onClick={() => onChange("long")}
        className={cn(
          "flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
          direction === "long"
            ? "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/40"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <ArrowUpRight className="size-4" />
        Long
      </button>
      <button
        type="button"
        onClick={() => onChange("short")}
        className={cn(
          "flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
          direction === "short"
            ? "bg-red-500/15 text-red-200 ring-1 ring-red-400/40"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <ArrowDownRight className="size-4" />
        Short
      </button>
    </div>
  );
}

function ResultMetric({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "neutral" | "good" | "warn" | "danger";
}) {
  return <MetricCard label={label} value={value} detail={detail} tone={tone} />;
}

export function TradeAnalyzer() {
  const [form, setForm] = useState<FormState>(defaultForm);

  const analysis = useMemo(() => analyzeForm(form), [form]);
  const riskConfig = analysis ? riskLevelConfig[analysis.riskLevel] : null;

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const symbolLabel = form.symbol.trim() || "—";
  const directionLabel = form.direction === "long" ? "Long" : "Short";

  return (
    <>
      <PageHeader
        eyebrow="Phân tích vị thế"
        title="Máy tính rủi ro futures"
        description="Nhập thông số lệnh để ước tính thanh lý, rủi ro và tỷ lệ R:R. Kết quả chỉ mang tính giáo dục, không phải khuyến nghị giao dịch."
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Card className="rounded-xl border-border/80 bg-card/78 shadow-sm">
          <CardHeader className="border-b border-border">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Calculator className="size-5" />
              </div>
              <div>
                <CardTitle>Thông số lệnh</CardTitle>
                <CardDescription className="mt-1">
                  Cập nhật số liệu để xem phân tích rủi ro theo thời gian thực.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6">
            <div className="grid gap-2">
              <Label htmlFor="symbol">Cặp / mã (symbol)</Label>
              <Input
                id="symbol"
                value={form.symbol}
                onChange={(event) => updateField("symbol", event.target.value)}
                placeholder="VD: BTC, ETH, SOL"
                className="font-mono"
              />
            </div>

            <div className="grid gap-2">
              <Label>Hướng lệnh</Label>
              <DirectionToggle
                direction={form.direction}
                onChange={(direction) => updateField("direction", direction)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="margin">Ký quỹ (USDT)</Label>
                <Input
                  id="margin"
                  inputMode="decimal"
                  value={form.margin}
                  onChange={(event) => updateField("margin", event.target.value)}
                  placeholder="100"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="leverage">Đòn bẩy (x)</Label>
                <Input
                  id="leverage"
                  inputMode="numeric"
                  value={form.leverage}
                  onChange={(event) => updateField("leverage", event.target.value)}
                  placeholder="10"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="entryPrice">Giá vào lệnh</Label>
              <Input
                id="entryPrice"
                inputMode="decimal"
                value={form.entryPrice}
                onChange={(event) => updateField("entryPrice", event.target.value)}
                placeholder="65000"
                className="font-mono"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="stopLoss">Stop loss</Label>
                <Input
                  id="stopLoss"
                  inputMode="decimal"
                  value={form.stopLoss}
                  onChange={(event) => updateField("stopLoss", event.target.value)}
                  placeholder="63000"
                  className="font-mono"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="takeProfit">Take profit</Label>
                <Input
                  id="takeProfit"
                  inputMode="decimal"
                  value={form.takeProfit}
                  onChange={(event) => updateField("takeProfit", event.target.value)}
                  placeholder="70000"
                  className="font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-xl border-border/80 bg-card/78 shadow-sm xl:sticky xl:top-4">
            <CardHeader className="border-b border-border">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Kết quả phân tích</CardTitle>
                  <CardDescription className="mt-1">
                    {symbolLabel} · {directionLabel}
                    {parsePositive(form.leverage) ? ` · ${form.leverage}x` : ""}
                  </CardDescription>
                </div>
                {riskConfig ? (
                  <Badge variant="outline" className={cn("px-2.5 py-1", riskConfig.badgeClass)}>
                    Rủi ro {riskConfig.label}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Chưa đủ dữ liệu
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {!analysis ? (
                <Alert className="border-amber-400/20 bg-amber-400/8">
                  <AlertTriangle className="text-amber-300" />
                  <AlertTitle>Nhập đủ thông số</AlertTitle>
                  <AlertDescription>
                    Cần ký quỹ, đòn bẩy và giá vào lệnh hợp lệ (&gt; 0) để tính toán rủi ro.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ResultMetric
                      label="Giá trị danh nghĩa"
                      value={formatUsdt(analysis.notionalValue)}
                      detail="Margin × đòn bẩy"
                      tone="neutral"
                    />
                    <ResultMetric
                      label="Giá thanh lý ước tính"
                      value={formatPrice(analysis.liquidationPrice)}
                      detail={
                        form.direction === "long"
                          ? "Giá giảm mạnh có thể kích hoạt thanh lý"
                          : "Giá tăng mạnh có thể kích hoạt thanh lý"
                      }
                      tone="danger"
                    />
                    <ResultMetric
                      label="Rủi ro (tối đa theo SL)"
                      value={analysis.riskAmount !== null ? formatUsdt(analysis.riskAmount) : "—"}
                      detail={
                        analysis.riskAmount !== null
                          ? "Ước tính từ khoảng cách tới stop loss"
                          : "Nhập stop loss để ước tính"
                      }
                      tone={analysis.riskAmount !== null ? "warn" : "neutral"}
                    />
                    <ResultMetric
                      label="Lợi nhuận kỳ vọng (theo TP)"
                      value={
                        analysis.rewardAmount !== null ? formatUsdt(analysis.rewardAmount) : "—"
                      }
                      detail={
                        analysis.rewardAmount !== null
                          ? "Ước tính từ khoảng cách tới take profit"
                          : "Nhập take profit để ước tính"
                      }
                      tone={analysis.rewardAmount !== null ? "good" : "neutral"}
                    />
                  </div>

                  <div className="rounded-lg border border-border bg-muted/25 p-4">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Tỷ lệ Risk : Reward</p>
                        <p className="mt-1 text-2xl font-semibold text-sky-200">
                          {analysis.rrRatio !== null ? formatRatio(analysis.rrRatio) : "—"}
                        </p>
                      </div>
                      <p className="max-w-xs text-xs leading-5 text-muted-foreground">
                        R:R &lt; 1.5 thường được coi là thấp. Đây chỉ là số liệu tham khảo, không
                        đảm bảo kết quả giao dịch.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {analysis && analysis.warnings.length > 0 ? (
            <Card className="rounded-xl border-amber-400/15 bg-amber-400/5">
              <CardHeader className="border-b border-amber-400/15 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="size-5 text-amber-300" />
                  <CardTitle className="text-base">Cảnh báo rủi ro</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {analysis.warnings.map((warning) => (
                  <div
                    key={warning}
                    className="rounded-lg border border-amber-400/15 bg-background/40 px-3 py-2.5 text-sm leading-6 text-muted-foreground"
                  >
                    {warning}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          <p className="text-xs leading-5 text-muted-foreground">{TRADEGUARD_DISCLAIMER}</p>
        </div>
      </div>
    </>
  );
}
