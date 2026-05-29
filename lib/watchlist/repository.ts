import { toJournalUserMessage, logJournalError } from "@/lib/journal/errors";
import { parseWatchlistRows } from "@/lib/watchlist/entries";
import { watchlistSymbolSchema } from "@/lib/watchlist/schema";
import type { WatchlistEntry } from "@/lib/watchlist/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const WATCHLIST_COLUMNS = "id, user_id, symbol, created_at" as const;
const MAX_WATCHLIST_SIZE = 24;

type RepositoryError = { ok: false; error: string };
type RepositorySuccess<T> = { ok: true; data: T };
export type RepositoryResult<T> = RepositorySuccess<T> | RepositoryError;

async function requireUserId(): Promise<RepositoryResult<string>> {
  try {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      logJournalError("watchlist-auth", error);
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
    logJournalError("watchlist-auth", error);
    return { ok: false, error: "Không thể xác thực phiên đăng nhập." };
  }
}

export async function listWatchlistEntries(): Promise<RepositoryResult<WatchlistEntry[]>> {
  const userResult = await requireUserId();
  if (!userResult.ok) {
    return userResult;
  }

  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("watchlists")
      .select(WATCHLIST_COLUMNS)
      .eq("user_id", userResult.data)
      .order("created_at", { ascending: true });

    if (error) {
      logJournalError("watchlist-list", error);
      return {
        ok: false,
        error: toJournalUserMessage(error, "Không thể tải watchlist"),
      };
    }

    return {
      ok: true,
      data: parseWatchlistRows(data, userResult.data),
    };
  } catch (error) {
    logJournalError("watchlist-list", error);
    return { ok: false, error: "Không thể tải watchlist" };
  }
}

export async function addWatchlistSymbol(
  input: unknown,
): Promise<RepositoryResult<WatchlistEntry>> {
  const parsed = watchlistSymbolSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Symbol không hợp lệ",
    };
  }

  const userResult = await requireUserId();
  if (!userResult.ok) {
    return userResult;
  }

  try {
    const supabase = createSupabaseBrowserClient();

    const { count, error: countError } = await supabase
      .from("watchlists")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userResult.data);

    if (countError) {
      logJournalError("watchlist-count", countError);
      return {
        ok: false,
        error: toJournalUserMessage(countError, "Không thể kiểm tra watchlist"),
      };
    }

    if ((count ?? 0) >= MAX_WATCHLIST_SIZE) {
      return {
        ok: false,
        error: `Watchlist tối đa ${MAX_WATCHLIST_SIZE} symbol.`,
      };
    }

    const { data, error } = await supabase
      .from("watchlists")
      .insert({
        user_id: userResult.data,
        symbol: parsed.data,
      })
      .select(WATCHLIST_COLUMNS)
      .single();

    if (error) {
      logJournalError("watchlist-add", error);
      if (error.code === "23505") {
        return { ok: false, error: "Symbol đã có trong watchlist." };
      }
      return {
        ok: false,
        error: toJournalUserMessage(error, "Không thể thêm symbol"),
      };
    }

    const entries = parseWatchlistRows([data], userResult.data);
    const entry = entries[0];

    if (!entry) {
      return { ok: false, error: "Không thể đọc lại symbol vừa thêm" };
    }

    return { ok: true, data: entry };
  } catch (error) {
    logJournalError("watchlist-add", error);
    return { ok: false, error: "Không thể thêm symbol" };
  }
}

export async function removeWatchlistSymbol(symbol: string): Promise<RepositoryResult<null>> {
  const parsed = watchlistSymbolSchema.safeParse(symbol);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Symbol không hợp lệ",
    };
  }

  const userResult = await requireUserId();
  if (!userResult.ok) {
    return userResult;
  }

  try {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("watchlists")
      .delete()
      .eq("user_id", userResult.data)
      .eq("symbol", parsed.data);

    if (error) {
      logJournalError("watchlist-remove", error);
      return {
        ok: false,
        error: toJournalUserMessage(error, "Không thể xóa symbol"),
      };
    }

    return { ok: true, data: null };
  } catch (error) {
    logJournalError("watchlist-remove", error);
    return { ok: false, error: "Không thể xóa symbol" };
  }
}
