import { NextResponse } from "next/server";
import { z } from "zod";

import { calculateTrade } from "@/lib/trading/calculate-trade";

const SYSTEM_PROMPT = `You are TradeGuard AI, a crypto futures risk analysis assistant.

Strict rules (never break):
- Do NOT give financial advice.
- Do NOT tell the user to buy, sell, open long, open short, or enter a trade now.
- Do NOT guarantee profit, win rate, or prediction accuracy.
- Frame everything as educational risk analysis, scenarios, and risk management ideas.
- Always mention that outcomes are uncertain and liquidation risk exists with leverage.

Output structure (Vietnamese, concise, practical):
1. Tóm tắt setup
2. Rủi ro chính (bao gồm thanh lý, đòn bẩy, SL/TP nếu có)
3. Kịch bản tăng (bullish) — mô tả điều kiện, không khuyến nghị vào lệnh
4. Kịch bản giảm (bearish) — mô tả điều kiện, không khuyến nghị vào lệnh
5. Điều kiện vô hiệu hóa giả định
6. Gợi ý quản trị rủi ro (vị thế, SL, sizing) — mang tính giáo dục`;

const aiReviewRequestSchema = z.object({
  symbol: z.string().trim().min(1).max(24),
  direction: z.enum(["long", "short"]),
  margin: z.number().positive().max(10_000_000),
  leverage: z.number().positive().max(125),
  entryPrice: z.number().positive(),
  stopLoss: z.number().positive().optional(),
  takeProfit: z.number().positive().optional(),
});

type AiReviewRequest = z.infer<typeof aiReviewRequestSchema>;

function buildUserPrompt(input: AiReviewRequest) {
  const analysis = calculateTrade({
    direction: input.direction,
    margin: input.margin,
    leverage: input.leverage,
    entryPrice: input.entryPrice,
    stopLoss: input.stopLoss,
    takeProfit: input.takeProfit,
  });

  return [
    "Review this futures setup for educational risk analysis only.",
    "",
    `Symbol: ${input.symbol}`,
    `Direction: ${input.direction}`,
    `Margin (USDT): ${input.margin}`,
    `Leverage: ${input.leverage}x`,
    `Entry: ${input.entryPrice}`,
    `Stop loss: ${input.stopLoss ?? "not provided"}`,
    `Take profit: ${input.takeProfit ?? "not provided"}`,
    "",
    "Calculated metrics:",
    `- Notional value: ${analysis.notionalValue}`,
    `- Estimated liquidation price: ${analysis.liquidationPrice}`,
    `- Risk amount (SL): ${analysis.riskAmount ?? "n/a"}`,
    `- Reward amount (TP): ${analysis.rewardAmount ?? "n/a"}`,
    `- R:R ratio: ${analysis.rrRatio ?? "n/a"}`,
    `- Risk level: ${analysis.riskLevel}`,
    `- Warnings: ${analysis.warnings.length > 0 ? analysis.warnings.join("; ") : "none"}`,
  ].join("\n");
}

function validationErrorResponse(error: z.ZodError) {
  return NextResponse.json(
    {
      error: "Invalid request body",
      details: error.flatten(),
    },
    { status: 400 },
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const parsed = aiReviewRequestSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    console.error("[ai-review] OPENAI_API_KEY is not configured");
    return NextResponse.json({ error: "AI review is temporarily unavailable" }, { status: 503 });
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  try {
    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(parsed.data) },
        ],
      }),
      signal: AbortSignal.timeout(60_000),
    });

    const payload: unknown = await openAiResponse.json().catch(() => null);

    if (!openAiResponse.ok) {
      console.error("[ai-review] OpenAI request failed", {
        status: openAiResponse.status,
        payload,
      });
      return NextResponse.json({ error: "Failed to generate AI review" }, { status: 502 });
    }

    const review = extractReviewText(payload);
    if (!review) {
      console.error("[ai-review] OpenAI returned empty content", payload);
      return NextResponse.json({ error: "Failed to generate AI review" }, { status: 502 });
    }

    return NextResponse.json({ review });
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === "TimeoutError";

    console.error("[ai-review] Unexpected error", error);

    return NextResponse.json(
      {
        error: isTimeout
          ? "AI review timed out. Please try again."
          : "Failed to generate AI review",
      },
      { status: isTimeout ? 504 : 500 },
    );
  }
}

function extractReviewText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const choices = Reflect.get(payload, "choices");
  if (!Array.isArray(choices) || choices.length === 0) {
    return null;
  }

  const firstChoice = choices[0];
  if (!firstChoice || typeof firstChoice !== "object") {
    return null;
  }

  const message = Reflect.get(firstChoice, "message");
  if (!message || typeof message !== "object") {
    return null;
  }

  const content = Reflect.get(message, "content");
  if (typeof content !== "string") {
    return null;
  }

  const trimmed = content.trim();
  return trimmed.length > 0 ? trimmed : null;
}
