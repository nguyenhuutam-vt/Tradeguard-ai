"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { Loader2, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/tradeguard/app-shell";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { WorkspaceUser } from "@/lib/tradeguard/domain";

function getUserName(user: User) {
  const metadataName = typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "";

  if (metadataName.trim()) {
    return metadataName.trim();
  }

  return user.email?.split("@")[0] || "Trader";
}

function toWorkspaceUser(user: User): WorkspaceUser {
  return {
    name: getUserName(user),
    role: "Trader phòng thủ",
    plan: "Risk Lab",
  };
}

export function WorkspaceAuthShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<WorkspaceUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let mounted = true;
    let client: SupabaseClient;

    try {
      client = createSupabaseBrowserClient();
    } catch {
      router.replace("/login");
      return;
    }

    client.auth.getUser().then(({ data }) => {
      if (!mounted) {
        return;
      }

      if (!data.user) {
        router.replace("/login");
        return;
      }

      setUser(toWorkspaceUser(data.user));
      setIsCheckingSession(false);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        router.replace("/login");
        return;
      }

      setUser(toWorkspaceUser(session.user));
      setIsCheckingSession(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (isCheckingSession || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </span>
          <Loader2 className="size-4 animate-spin" />
          Đang kiểm tra phiên đăng nhập...
        </div>
      </main>
    );
  }

  return <AppShell user={user}>{children}</AppShell>;
}
