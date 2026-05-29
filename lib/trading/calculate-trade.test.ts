import { describe, expect, it } from "vitest";

import { calculateTrade } from "./calculate-trade";

describe("calculateTrade", () => {
  it("calculates long position size, notional value, and liquidation price", () => {
    const result = calculateTrade({
      direction: "long",
      margin: 100,
      leverage: 10,
      entryPrice: 50_000,
    });

    expect(result.notionalValue).toBe(1_000);
    expect(result.positionSize).toBeCloseTo(0.02);
    expect(result.liquidationPrice).toBeCloseTo(45_000);
    expect(result.riskLevel).toBe("high");
  });

  it("calculates short liquidation price", () => {
    const result = calculateTrade({
      direction: "short",
      margin: 100,
      leverage: 10,
      entryPrice: 50_000,
    });

    expect(result.liquidationPrice).toBeCloseTo(55_000);
  });

  it("calculates risk, reward, and risk/reward ratio when stop loss and take profit are set", () => {
    const result = calculateTrade({
      direction: "long",
      margin: 100,
      leverage: 10,
      entryPrice: 50_000,
      stopLoss: 49_000,
      takeProfit: 52_000,
    });

    expect(result.riskAmount).toBeCloseTo(20);
    expect(result.rewardAmount).toBeCloseTo(40);
    expect(result.rrRatio).toBeCloseTo(2);
  });

  it("warns when stop loss is missing", () => {
    const result = calculateTrade({
      direction: "long",
      margin: 100,
      leverage: 5,
      entryPrice: 50_000,
    });

    expect(result.warnings).toContain(
      "Bạn chưa nhập stop loss. Đây là rủi ro lớn khi giao dịch futures.",
    );
    expect(result.riskLevel).toBe("medium");
  });

  it("warns on extreme leverage", () => {
    const result = calculateTrade({
      direction: "long",
      margin: 100,
      leverage: 25,
      entryPrice: 50_000,
      stopLoss: 49_000,
    });

    expect(result.riskLevel).toBe("extreme");
    expect(result.warnings).toContain(
      "Đòn bẩy rất cao. Rủi ro thanh lý mạnh khi thị trường biến động.",
    );
  });

  it("warns when risk/reward ratio is below 1.5", () => {
    const result = calculateTrade({
      direction: "long",
      margin: 100,
      leverage: 5,
      entryPrice: 50_000,
      stopLoss: 49_000,
      takeProfit: 50_500,
    });

    expect(result.rrRatio).toBeCloseTo(0.5);
    expect(result.warnings).toContain(
      "Tỷ lệ Risk/Reward thấp. Setup này có thể không đáng để vào lệnh.",
    );
  });
});
