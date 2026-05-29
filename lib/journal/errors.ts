const TABLE_MISSING_CODES = new Set(["42P01", "PGRST205"]);
const AUTH_ERROR_MARKERS = ["jwt", "session", "not authenticated", "invalid claim"];

export function toJournalUserMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== "object") {
    return fallback;
  }

  const record = error as Record<string, unknown>;
  const code = typeof record.code === "string" ? record.code : "";
  const message = typeof record.message === "string" ? record.message.toLowerCase() : "";

  if (TABLE_MISSING_CODES.has(code)) {
    return "Bảng dữ liệu chưa được tạo trên Supabase. Vui lòng chạy migration.";
  }

  if (code === "42703" || message.includes("does not exist")) {
    return "Schema Supabase chưa đồng bộ với app. Vui lòng chạy migration mới nhất trong thư mục supabase/migrations.";
  }

  if (code === "42501" || message.includes("permission denied")) {
    return "Bạn không có quyền truy cập dữ liệu này.";
  }

  if (AUTH_ERROR_MARKERS.some((marker) => message.includes(marker)) || code === "PGRST301") {
    return "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.";
  }

  if (code === "23514") {
    return "Dữ liệu không đáp ứng quy tắc lưu trữ (symbol, đòn bẩy, cảm xúc).";
  }

  if (code === "23505") {
    return "Bản ghi đã tồn tại.";
  }

  if (message.includes("network") || message.includes("fetch")) {
    return "Không thể kết nối máy chủ. Kiểm tra mạng và thử lại.";
  }

  return fallback;
}

export function logJournalError(scope: string, error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    const details =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : error;
    console.error(`[journal:${scope}]`, details);
  }
}
