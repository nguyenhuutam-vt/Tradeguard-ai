import { z } from "zod";

export const watchlistSymbolSchema = z
  .string()
  .trim()
  .min(1, "Symbol là bắt buộc")
  .max(24, "Symbol tối đa 24 ký tự")
  .regex(/^[A-Za-z0-9]+$/, "Symbol chỉ gồm chữ và số")
  .transform((value) => value.toUpperCase());
