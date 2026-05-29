export type TradeDirection = "long" | "short";

export type TradeInput = {
  direction: TradeDirection;
  margin: number;
  leverage: number;
  entryPrice: number;
  stopLoss?: number;
  takeProfit?: number;
};

export type TradeAnalysis = {
  positionSize: number;
  notionalValue: number;
  liquidationPrice: number;
  riskAmount: number | null;
  rewardAmount: number | null;
  rrRatio: number | null;
  riskLevel: "low" | "medium" | "high" | "extreme";
  warnings: string[];
};

export function calculateTrade(input: TradeInput): TradeAnalysis {
  const warnings: string[] = [];

  const notionalValue = input.margin * input.leverage;
  const positionSize = notionalValue / input.entryPrice;

  const liquidationPrice =
    input.direction === "long"
      ? input.entryPrice * (1 - 1 / input.leverage)
      : input.entryPrice * (1 + 1 / input.leverage);

  let riskAmount: number | null = null;
  let rewardAmount: number | null = null;
  let rrRatio: number | null = null;

  if (input.stopLoss) {
    riskAmount = Math.abs(input.entryPrice - input.stopLoss) * positionSize;
  }

  if (input.takeProfit) {
    rewardAmount = Math.abs(input.takeProfit - input.entryPrice) * positionSize;
  }

  if (riskAmount && rewardAmount && riskAmount > 0) {
    rrRatio = rewardAmount / riskAmount;
  }

  if (input.leverage >= 20) {
    warnings.push("Đòn bẩy rất cao. Rủi ro thanh lý mạnh khi thị trường biến động.");
  } else if (input.leverage >= 10) {
    warnings.push("Đòn bẩy cao. Nên kiểm tra kỹ stop loss và khối lượng lệnh.");
  }

  if (!input.stopLoss) {
    warnings.push("Bạn chưa nhập stop loss. Đây là rủi ro lớn khi giao dịch futures.");
  }

  if (rrRatio !== null && rrRatio < 1.5) {
    warnings.push("Tỷ lệ Risk/Reward thấp. Setup này có thể không đáng để vào lệnh.");
  }

  const riskLevel =
    input.leverage >= 20
      ? "extreme"
      : input.leverage >= 10
        ? "high"
        : input.leverage >= 5
          ? "medium"
          : "low";

  return {
    positionSize,
    notionalValue,
    liquidationPrice,
    riskAmount,
    rewardAmount,
    rrRatio,
    riskLevel,
    warnings,
  };
}
