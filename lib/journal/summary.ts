import type { JournalSummary, Trade, TradeEmotion } from "@/lib/journal/types";

export function computeJournalSummary(trades: readonly Trade[]): JournalSummary {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      totalPnl: 0,
      mostCommonEmotion: null,
    };
  }

  const wins = trades.filter((trade) => trade.resultPnl > 0).length;
  const totalPnl = trades.reduce((sum, trade) => sum + trade.resultPnl, 0);

  const emotionCounts = new Map<TradeEmotion, number>();
  for (const trade of trades) {
    emotionCounts.set(trade.emotion, (emotionCounts.get(trade.emotion) ?? 0) + 1);
  }

  let mostCommonEmotion: TradeEmotion | null = null;
  let maxCount = 0;

  for (const [emotion, count] of emotionCounts) {
    if (count > maxCount) {
      maxCount = count;
      mostCommonEmotion = emotion;
    }
  }

  return {
    totalTrades: trades.length,
    winRate: Math.round((wins / trades.length) * 100),
    totalPnl,
    mostCommonEmotion,
  };
}
