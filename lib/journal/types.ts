import type { TradeDirection } from "@/lib/trading/calculate-trade";
import type { TradesRow } from "@/lib/supabase/database";

export const TRADE_EMOTIONS = [
  "Bình tĩnh",
  "FOMO",
  "Sợ hãi",
  "Tự tin",
  "Tham lam",
  "Trả thù thị trường",
  "Mệt mỏi",
] as const;

export type TradeEmotion = (typeof TRADE_EMOTIONS)[number];

export type TradeRow = TradesRow;

export type Trade = {
  id: string;
  userId: string;
  symbol: string;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice: number;
  leverage: number;
  resultPnl: number;
  emotion: TradeEmotion;
  notes: string | null;
  createdAt: string;
};

export type TradeInsert = {
  symbol: string;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice: number;
  leverage: number;
  resultPnl: number;
  emotion: TradeEmotion;
  notes?: string;
};

export type JournalSummary = {
  totalTrades: number;
  winRate: number;
  totalPnl: number;
  mostCommonEmotion: TradeEmotion | null;
};
