import { logJournalError, toJournalUserMessage } from "@/lib/journal/errors";
import { tradeInsertSchema } from "@/lib/journal/schema";
import { parseTradeRows, toTradeInsertPayload } from "@/lib/journal/trades";
import type { Trade } from "@/lib/journal/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const TRADE_COLUMNS =
  "id, user_id, symbol, direction, entry_price, exit_price, leverage, result_pnl, emotion, notes, created_at" as const;

type RepositoryError = {
  ok: false;
  error: string;
};

type RepositorySuccess<T> = {
  ok: true;
  data: T;
};

export type RepositoryResult<T> = RepositorySuccess<T> | RepositoryError;

async function requireUserId(): Promise<RepositoryResult<string>> {
  try {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      logJournalError("auth", error);
      return {
        ok: false,
        error: toJournalUserMessage(error, "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại."),
      };
    }

    if (!user) {
      return {
        ok: false,
        error: "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
      };
    }

    return { ok: true, data: user.id };
  } catch (error) {
    logJournalError("auth", error);
    return {
      ok: false,
      error: "Không thể xác thực phiên đăng nhập.",
    };
  }
}

export async function listJournalTrades(): Promise<RepositoryResult<Trade[]>> {
  const userResult = await requireUserId();
  if (!userResult.ok) {
    return userResult;
  }

  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("trades")
      .select(TRADE_COLUMNS)
      .eq("user_id", userResult.data)
      .order("created_at", { ascending: false });

    if (error) {
      logJournalError("list", error);
      return {
        ok: false,
        error: toJournalUserMessage(error, "Không thể tải nhật ký giao dịch"),
      };
    }

    const trades = parseTradeRows(data, userResult.data);
    return { ok: true, data: trades };
  } catch (error) {
    logJournalError("list", error);
    return {
      ok: false,
      error: "Không thể tải nhật ký giao dịch",
    };
  }
}

export async function createJournalTrade(input: unknown): Promise<RepositoryResult<Trade>> {
  const parsed = tradeInsertSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ",
    };
  }

  const userResult = await requireUserId();
  if (!userResult.ok) {
    return userResult;
  }

  try {
    const supabase = createSupabaseBrowserClient();
    const payload = toTradeInsertPayload(userResult.data, parsed.data);

    const { data, error } = await supabase
      .from("trades")
      .insert(payload)
      .select(TRADE_COLUMNS)
      .single();

    if (error) {
      logJournalError("create", error);
      return {
        ok: false,
        error: toJournalUserMessage(error, "Không thể lưu giao dịch"),
      };
    }

    const trades = parseTradeRows(data ? [data] : [], userResult.data);
    const trade = trades[0];

    if (!trade) {
      logJournalError("create", { message: "Invalid row returned after insert" });
      return {
        ok: false,
        error: "Không thể đọc lại giao dịch vừa lưu",
      };
    }

    return { ok: true, data: trade };
  } catch (error) {
    logJournalError("create", error);
    return {
      ok: false,
      error: "Không thể lưu giao dịch",
    };
  }
}
