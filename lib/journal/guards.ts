import { TRADE_EMOTIONS, type TradeEmotion } from "@/lib/journal/types";
import type { TradeDirection } from "@/lib/trading/calculate-trade";

export function parseTradeDirection(value: string): TradeDirection | null {
  if (value === "long" || value === "short") {
    return value;
  }
  return null;
}

export function parseTradeEmotion(value: string): TradeEmotion | null {
  if ((TRADE_EMOTIONS as readonly string[]).includes(value)) {
    return value as TradeEmotion;
  }
  return null;
}
