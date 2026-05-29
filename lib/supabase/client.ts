import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database";

let browserClient: SupabaseClient<Database> | undefined;

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  if (!browserClient) {
    browserClient = createClient<Database>(url, anonKey);
  }

  return browserClient;
}
