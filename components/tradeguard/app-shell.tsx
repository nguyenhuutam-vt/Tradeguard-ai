"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Binoculars,
  ClipboardList,
  Gauge,
  LifeBuoy,
  Loader2,
  LogOut,
  SearchCheck,
  Settings,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { WorkspaceUser } from "@/lib/tradeguard/domain";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Tổng quan", icon: Gauge },
  { href: "/analyze", label: "Phân tích", icon: SearchCheck },
  { href: "/journal", label: "Nhật ký", icon: ClipboardList },
  { href: "/watchlist", label: "Theo dõi", icon: Binoculars },
  { href: "/settings", label: "Cài đặt", icon: Settings },
];

export function AppShell({ children, user }: { children: ReactNode; user: WorkspaceUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border bg-sidebar/95 px-3 py-4 backdrop-blur lg:flex lg:flex-col">
        <Link href="/" className="flex items-center gap-3 px-2 py-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </span>
          <span>
            <span className="block text-base font-semibold text-sidebar-foreground">
              TradeGuard AI
            </span>
            <span className="block text-xs text-muted-foreground">Risk assistant</span>
          </span>
        </Link>

        <nav className="mt-7 flex flex-1 flex-col gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  active &&
                    "bg-sidebar-accent text-sidebar-accent-foreground ring-1 ring-sidebar-border",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="rounded-lg border border-sidebar-border bg-background/45 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-sidebar-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
            <Badge className="bg-primary/15 text-primary" variant="outline">
              {user.plan}
            </Badge>
          </div>
          <Button
            className="mt-3 w-full justify-start"
            variant="outline"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4" />
            )}
            Đăng xuất
          </Button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border bg-background/88 backdrop-blur">
          <div className="flex min-h-16 flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <Link href="/" className="flex items-center gap-2 lg:hidden">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <ShieldCheck className="size-4" />
                </span>
                <span className="text-sm font-semibold">TradeGuard AI</span>
              </Link>
              <div className="hidden lg:block">
                <p className="text-sm text-muted-foreground">Phiên đăng nhập Supabase</p>
                <p className="text-base font-medium">Xin chào, {user.name}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="hidden border-amber-400/30 text-amber-200 sm:inline-flex"
                >
                  Không phải lời khuyên tài chính
                </Badge>
                <Button variant="outline" size="icon" aria-label="Thông báo">
                  <Bell className="size-4" />
                </Button>
                <Button variant="outline" size="icon" aria-label="Hỗ trợ">
                  <LifeBuoy className="size-4" />
                </Button>
                <Button
                  className="lg:hidden"
                  variant="outline"
                  size="icon"
                  aria-label="Đăng xuất"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LogOut className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex h-9 shrink-0 items-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground",
                      active && "border-primary/45 bg-primary/12 text-primary",
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
