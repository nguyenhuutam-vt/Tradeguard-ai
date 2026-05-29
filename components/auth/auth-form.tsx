"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthMode = "login" | "register";

const authCopy = {
  login: {
    title: "Đăng nhập",
    description: "Tiếp tục vào dashboard quản trị rủi ro của TradeGuard AI.",
    submit: "Đăng nhập",
    loading: "Đang đăng nhập...",
    switchText: "Chưa có tài khoản?",
    switchAction: "Tạo tài khoản",
    switchHref: "/register",
  },
  register: {
    title: "Tạo tài khoản",
    description: "Đăng ký bằng email để bắt đầu theo dõi rủi ro danh mục.",
    submit: "Đăng ký",
    loading: "Đang tạo tài khoản...",
    switchText: "Đã có tài khoản?",
    switchAction: "Đăng nhập",
    switchHref: "/login",
  },
} satisfies Record<AuthMode, Record<string, string>>;

function getAuthErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Email hoặc mật khẩu chưa chính xác.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Email chưa được xác nhận. Vui lòng kiểm tra hộp thư của bạn.";
  }

  if (normalized.includes("password")) {
    return "Mật khẩu cần đủ mạnh và có ít nhất 6 ký tự.";
  }

  if (normalized.includes("already registered") || normalized.includes("already exists")) {
    return "Email này đã được đăng ký. Bạn có thể đăng nhập ngay.";
  }

  return "Có lỗi xảy ra. Vui lòng thử lại sau ít phút.";
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const copy = authCopy[mode];
  const supabaseRef = useRef<SupabaseClient | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;
    let client: SupabaseClient;

    try {
      client = createSupabaseBrowserClient();
      supabaseRef.current = client;
    } catch {
      Promise.resolve().then(() => {
        if (!mounted) {
          return;
        }

        setError(
          "Thiếu cấu hình Supabase. Vui lòng thiết lập NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        );
        setIsCheckingSession(false);
      });
      return;
    }

    client.auth.getSession().then(({ data }) => {
      if (!mounted) {
        return;
      }

      if (data.session) {
        router.replace("/dashboard");
        return;
      }

      setIsCheckingSession(false);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace("/dashboard");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const supabase = supabaseRef.current;

    if (!supabase) {
      setError(
        "Thiếu cấu hình Supabase. Vui lòng thiết lập NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
      return;
    }

    setIsSubmitting(true);

    const credentials = {
      email: email.trim(),
      password,
    };

    const { data, error: authError } =
      mode === "login"
        ? await supabase.auth.signInWithPassword(credentials)
        : await supabase.auth.signUp(credentials);

    setIsSubmitting(false);

    if (authError) {
      setError(getAuthErrorMessage(authError.message));
      return;
    }

    if (data.session) {
      router.replace("/dashboard");
      router.refresh();
      return;
    }

    if (mode === "register") {
      setSuccess("Tài khoản đã được tạo. Vui lòng kiểm tra email để xác nhận trước khi đăng nhập.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-md">
        <Link href="/" className="mx-auto mb-6 flex w-fit items-center gap-3 text-sm font-semibold">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </span>
          TradeGuard AI
        </Link>

        <Card className="rounded-lg bg-card/80">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-xl">{copy.title}</CardTitle>
            <CardDescription>{copy.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {isCheckingSession ? (
              <div className="flex min-h-52 items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" />
                Đang kiểm tra phiên đăng nhập...
              </div>
            ) : (
              <form className="grid gap-4" onSubmit={handleSubmit}>
                {error ? (
                  <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertTitle>Không thể tiếp tục</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}

                {success ? (
                  <Alert>
                    <CheckCircle2 className="size-4 text-primary" />
                    <AlertTitle>Kiểm tra email</AlertTitle>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                ) : null}

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="ban@example.com"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    minLength={6}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {copy.loading}
                    </>
                  ) : (
                    <>
                      {copy.submit}
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  {copy.switchText}{" "}
                  <Link className="font-medium text-primary hover:underline" href={copy.switchHref}>
                    {copy.switchAction}
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
