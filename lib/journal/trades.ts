import { TRADE_EMOTIONS, type Trade, type TradeInsert, type TradeRow } from "@/lib/journal/types";
import type { TradesInsert } from "@/lib/supabase/database";
import type { TradeDirection } from "@/lib/trading/calculate-trade";

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function isTradeDirection(value: string): value is TradeDirection {
  return value === "long" || value === "short";
}

function isTradeEmotion(value: string): value is Trade["emotion"] {
  return (TRADE_EMOTIONS as readonly string[]).includes(value);
}

export function mapTradeRow(row: TradeRow, expectedUserId?: string): Trade | null {
  if (expectedUserId && row.user_id !== expectedUserId) {
    return null;
  }

  const entryPrice = toNumber(row.entry_price);
  const exitPrice = toNumber(row.exit_price);
  const leverage = toNumber(row.leverage);
  const resultPnl = toNumber(row.result_pnl);

  if (
    entryPrice === null ||
    exitPrice === null ||
    leverage === null ||
    resultPnl === null ||
    entryPrice <= 0 ||
    exitPrice <= 0 ||
    leverage <= 0 ||
    leverage > 125 ||
    !isTradeDirection(row.direction) ||
    !isTradeEmotion(row.emotion) ||
    !/^[A-Z0-9]{1,24}$/.test(row.symbol)
  ) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    symbol: row.symbol,
    direction: row.direction,
    entryPrice,
    exitPrice,
    leverage,
    resultPnl,
    emotion: row.emotion,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export function toTradeInsertPayload(userId: string, input: TradeInsert): TradesInsert {
  return {
    user_id: userId,
    symbol: input.symbol,
    direction: input.direction,
    entry_price: input.entryPrice,
    exit_price: input.exitPrice,
    leverage: input.leverage,
    result_pnl: input.resultPnl,
    emotion: input.emotion,
    notes: input.notes ?? null,
  };
}

function isTradeRow(value: unknown): value is TradeRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Record<string, unknown>;

  return (
    typeof row.id === "string" &&
    typeof row.user_id === "string" &&
    typeof row.symbol === "string" &&
    typeof row.direction === "string" &&
    typeof row.emotion === "string" &&
    typeof row.created_at === "string" &&
    (row.notes === null || typeof row.notes === "string") &&
    (typeof row.entry_price === "number" || typeof row.entry_price === "string") &&
    (typeof row.exit_price === "number" || typeof row.exit_price === "string") &&
    (typeof row.leverage === "number" || typeof row.leverage === "string") &&
    (typeof row.result_pnl === "number" || typeof row.result_pnl === "string")
  );
}

export function parseTradeRows(rows: unknown, expectedUserId?: string): Trade[] {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .filter(isTradeRow)
    .map((row) => mapTradeRow(row, expectedUserId))
    .filter((trade): trade is Trade => trade !== null);
}
