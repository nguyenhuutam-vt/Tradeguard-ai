import { z } from "zod";

import { TRADE_EMOTIONS } from "@/lib/journal/types";

const symbolSchema = z
  .string()
  .trim()
  .min(1, "Symbol là bắt buộc")
  .max(24, "Symbol tối đa 24 ký tự")
  .regex(/^[A-Za-z0-9]+$/, "Symbol chỉ gồm chữ và số")
  .transform((value) => value.toUpperCase());

const finiteNumber = (label: string) =>
  z.coerce
    .number({ message: `${label} phải là số` })
    .refine(Number.isFinite, `${label} không hợp lệ`);

export const tradeInsertSchema = z.object({
  symbol: symbolSchema,
  direction: z.enum(["long", "short"]),
  entryPrice: finiteNumber("Giá vào").positive("Giá vào phải lớn hơn 0"),
  exitPrice: finiteNumber("Giá thoát").positive("Giá thoát phải lớn hơn 0"),
  leverage: finiteNumber("Đòn bẩy")
    .positive("Đòn bẩy phải lớn hơn 0")
    .max(125, "Đòn bẩy tối đa 125"),
  resultPnl: finiteNumber("PnL").min(-1_000_000, "PnL quá thấp").max(1_000_000, "PnL quá cao"),
  emotion: z.enum(TRADE_EMOTIONS, {
    message: "Chọn cảm xúc hợp lệ",
  }),
  notes: z
    .string()
    .trim()
    .max(2000, "Ghi chú tối đa 2000 ký tự")
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
});

export type TradeInsertInput = z.infer<typeof tradeInsertSchema>;
