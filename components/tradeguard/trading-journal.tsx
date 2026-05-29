"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Loader2,
  Plus,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { MetricCard, PageHeader } from "@/components/tradeguard/workspace-widgets";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { parseTradeDirection, parseTradeEmotion } from "@/lib/journal/guards";
import { createJournalTrade, listJournalTrades } from "@/lib/journal/repository";
import { computeJournalSummary } from "@/lib/journal/summary";
import { TRADE_EMOTIONS, type Trade, type TradeEmotion } from "@/lib/journal/types";
import type { TradeDirection } from "@/lib/trading/calculate-trade";
import { cn } from "@/lib/utils";

type FormState = {
  symbol: string;
  direction: TradeDirection;
  entryPrice: string;
  exitPrice: string;
  leverage: string;
  resultPnl: string;
  emotion: TradeEmotion;
  notes: string;
};

const emptyForm: FormState = {
  symbol: "",
  direction: "long",
  entryPrice: "",
  exitPrice: "",
  leverage: "10",
  resultPnl: "",
  emotion: "Bình tĩnh",
  notes: "",
};

function formatPnl(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value)}`;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: value >= 100 ? 2 : 6,
  }).format(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SummarySkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-lg border border-border bg-card/78 p-4">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="mt-4 h-8 w-20 rounded bg-muted" />
          <div className="mt-2 h-3 w-full rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function TradingJournal() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const summary = useMemo(() => computeJournalSummary(trades), [trades]);

  const loadTrades = useCallback(async (options?: { showLoading?: boolean }) => {
    if (options?.showLoading !== false) {
      setLoading(true);
    }
    setError(null);

    const result = await listJournalTrades();

    if (result.ok) {
      setTrades(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;

    void (async () => {
      const result = await listJournalTrades();
      if (!active) {
        return;
      }

      if (result.ok) {
        setTrades(result.data);
      } else {
        setError(result.error);
      }

      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setIsSaving(true);

    const result = await createJournalTrade({
      symbol: form.symbol,
      direction: form.direction,
      entryPrice: form.entryPrice,
      exitPrice: form.exitPrice,
      leverage: form.leverage,
      resultPnl: form.resultPnl,
      emotion: form.emotion,
      notes: form.notes || undefined,
    });

    if (!result.ok) {
      setFormError(result.error);
      setIsSaving(false);
      return;
    }

    setTrades((current) => [result.data, ...current]);
    setForm(emptyForm);
    setDialogOpen(false);
    setIsSaving(false);
  }

  const pnlTone = summary.totalPnl > 0 ? "good" : summary.totalPnl < 0 ? "danger" : "neutral";

  return (
    <>
      <PageHeader
        eyebrow="Nhật ký giao dịch"
        title="Ghi lại quy trình, không chỉ kết quả"
        description="Lưu từng lệnh với cảm xúc và ghi chú để rút kinh nghiệm rủi ro. Dữ liệu gắn với tài khoản đang đăng nhập."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void loadTrades()} disabled={loading}>
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
              Làm mới
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="size-4" />
                  Thêm giao dịch
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Thêm ghi chú giao dịch</DialogTitle>
                  <DialogDescription>
                    Ghi lại lệnh đã đóng để theo dõi kỷ luật và cảm xúc.
                  </DialogDescription>
                </DialogHeader>
                <form className="grid gap-4" onSubmit={handleSubmit}>
                  {formError ? (
                    <Alert variant="destructive">
                      <AlertTriangle className="size-4" />
                      <AlertTitle>Không lưu được</AlertTitle>
                      <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                  ) : null}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="journal-symbol">Symbol</Label>
                      <Input
                        id="journal-symbol"
                        value={form.symbol}
                        onChange={(event) => updateForm("symbol", event.target.value)}
                        placeholder="BTC"
                        required
                        className="font-mono uppercase"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Hướng lệnh</Label>
                      <Select
                        value={form.direction}
                        onValueChange={(value) => {
                          const direction = parseTradeDirection(value);
                          if (direction) {
                            updateForm("direction", direction);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="long">Long</SelectItem>
                          <SelectItem value="short">Short</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="journal-entry">Giá vào</Label>
                      <Input
                        id="journal-entry"
                        inputMode="decimal"
                        value={form.entryPrice}
                        onChange={(event) => updateForm("entryPrice", event.target.value)}
                        required
                        className="font-mono"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="journal-exit">Giá thoát</Label>
                      <Input
                        id="journal-exit"
                        inputMode="decimal"
                        value={form.exitPrice}
                        onChange={(event) => updateForm("exitPrice", event.target.value)}
                        required
                        className="font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="journal-leverage">Đòn bẩy</Label>
                      <Input
                        id="journal-leverage"
                        inputMode="numeric"
                        value={form.leverage}
                        onChange={(event) => updateForm("leverage", event.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="journal-pnl">Kết quả PnL (USDT)</Label>
                      <Input
                        id="journal-pnl"
                        inputMode="decimal"
                        value={form.resultPnl}
                        onChange={(event) => updateForm("resultPnl", event.target.value)}
                        placeholder="-12.5 hoặc 24"
                        required
                        className="font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Cảm xúc khi giao dịch</Label>
                    <Select
                      value={form.emotion}
                      onValueChange={(value) => {
                        const emotion = parseTradeEmotion(value);
                        if (emotion) {
                          updateForm("emotion", emotion);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRADE_EMOTIONS.map((emotion) => (
                          <SelectItem key={emotion} value={emotion}>
                            {emotion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="journal-notes">Ghi chú</Label>
                    <Textarea
                      id="journal-notes"
                      value={form.notes}
                      onChange={(event) => updateForm("notes", event.target.value)}
                      placeholder="Bài học, điều làm tốt, điều cần tránh..."
                      rows={4}
                    />
                  </div>

                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      disabled={isSaving}
                    >
                      Hủy
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <BookOpen className="size-4" />
                          Lưu giao dịch
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {error ? (
        <Alert className="mb-4 border-red-400/20 bg-red-400/8" variant="destructive">
          <AlertTriangle />
          <AlertTitle>Không tải được nhật ký</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadTrades()}
              disabled={loading}
            >
              Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {loading && trades.length === 0 ? (
        <SummarySkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Tổng lệnh"
            value={String(summary.totalTrades)}
            detail="Số giao dịch đã ghi trong nhật ký"
            tone="neutral"
          />
          <MetricCard
            label="Tỷ lệ thắng"
            value={`${summary.winRate}%`}
            detail="Lệnh có PnL dương / tổng lệnh"
            tone={summary.winRate >= 50 ? "good" : summary.winRate > 0 ? "warn" : "neutral"}
          />
          <MetricCard
            label="Tổng PnL"
            value={formatPnl(summary.totalPnl)}
            detail="Cộng dồn kết quả các lệnh đã ghi"
            tone={pnlTone}
          />
          <MetricCard
            label="Cảm xúc phổ biến"
            value={summary.mostCommonEmotion ?? "—"}
            detail="Cảm xúc xuất hiện nhiều nhất"
            tone="neutral"
          />
        </div>
      )}

      <Card className="mt-4 rounded-xl border-border/80 bg-card/78">
        <CardHeader className="border-b border-border">
          <CardTitle>Lịch sử giao dịch</CardTitle>
          <CardDescription>
            {trades.length > 0
              ? `${trades.length} mục · sắp xếp mới nhất trước`
              : "Chưa có giao dịch nào được lưu"}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pt-0">
          {loading && trades.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Đang tải nhật ký...
            </div>
          ) : trades.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
              <BookOpen className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Chưa có giao dịch. Thêm mục đầu tiên để bắt đầu theo dõi kỷ luật.
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="size-4" />
                Thêm giao dịch
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Hướng</TableHead>
                  <TableHead className="text-right">Vào</TableHead>
                  <TableHead className="text-right">Ra</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">Đòn bẩy</TableHead>
                  <TableHead className="text-right">PnL</TableHead>
                  <TableHead className="hidden md:table-cell">Cảm xúc</TableHead>
                  <TableHead className="hidden lg:table-cell">Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((trade) => {
                  const isWin = trade.resultPnl > 0;
                  const isLoss = trade.resultPnl < 0;

                  return (
                    <TableRow key={trade.id}>
                      <TableCell className="text-muted-foreground">
                        {formatDate(trade.createdAt)}
                      </TableCell>
                      <TableCell className="font-mono font-medium">{trade.symbol}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            trade.direction === "long"
                              ? "border-emerald-400/30 text-emerald-200"
                              : "border-red-400/30 text-red-200",
                          )}
                        >
                          {trade.direction === "long" ? (
                            <TrendingUp className="size-3" />
                          ) : (
                            <TrendingDown className="size-3" />
                          )}
                          {trade.direction}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatPrice(trade.entryPrice)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatPrice(trade.exitPrice)}
                      </TableCell>
                      <TableCell className="hidden text-right sm:table-cell">
                        {trade.leverage}x
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-medium",
                          isWin && "text-emerald-300",
                          isLoss && "text-red-300",
                        )}
                      >
                        {formatPnl(trade.resultPnl)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{trade.emotion}</TableCell>
                      <TableCell className="hidden max-w-[220px] truncate lg:table-cell text-muted-foreground">
                        {trade.notes || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
