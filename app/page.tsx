import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  LineChart,
  ListChecks,
  Radar,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TRADEGUARD_DISCLAIMER } from "@/lib/tradeguard/disclaimer";
import { clampPercent } from "@/lib/tradeguard/domain";

const painPoints = [
  {
    icon: TrendingDown,
    title: "Chart đẹp, nhưng không có số liquidation",
    text: "Bạn nhìn được xu hướng, nhưng chưa quy đổi margin + đòn bẩy thành mức giá có thể bị quét sạch tài khoản.",
  },
  {
    icon: ShieldAlert,
    title: "SL đặt muộn, thanh lý đến trước",
    text: "Futures không chờ bạn suy nghĩ lại. Một cây nến đối lập có thể chốt lỗ tự động bằng liquidation.",
  },
  {
    icon: Zap,
    title: "Nhóm signal ồn, checklist rủi ro thì trống",
    text: "Ai cũng kêu entry. Ít người hỏi: R:R bao nhiêu, risk bao nhiêu USDT, điều kiện nào làm setup sai?",
  },
  {
    icon: Target,
    title: "Trade nhiều, nhật ký ít",
    text: "Lặp FOMO, revenge trade, over-leverage — vì không ghi lại cảm xúc và quy trình trước khi bấm lệnh.",
  },
] as const;

const steps = [
  {
    step: "01",
    title: "Nhập setup futures",
    text: "Symbol, long/short, margin, leverage, entry, stop loss, take profit.",
  },
  {
    step: "02",
    title: "Xem số liệu rủi ro",
    text: "Notional, liquidation ước tính, risk/reward theo SL-TP, mức cảnh báo đòn bẩy.",
  },
  {
    step: "03",
    title: "AI review — bạn quyết định",
    text: "Nhận kịch bản tăng/giảm và điểm vô hiệu hóa giả định. Không có lệnh “vào ngay”.",
  },
] as const;

const features = [
  {
    icon: Calculator,
    title: "Máy tính rủi ro",
    text: "Tính liquidation, risk amount và R:R trước khi gửi lệnh lên sàn.",
    href: "/analyze",
  },
  {
    icon: Sparkles,
    title: "AI review tiếng Việt",
    text: "Phân tích giáo dục: rủi ro chính, kịch bản, quản trị vị thế — không kêu long/short.",
    href: "/analyze",
  },
  {
    icon: Radar,
    title: "Watchlist",
    text: "Ghim symbol, xem biến động 24h và nhãn nóng / biến động / ổn định.",
    href: "/watchlist",
  },
  {
    icon: BookOpen,
    title: "Nhật ký lệnh",
    text: "Lưu PnL, leverage, cảm xúc, ghi chú — nhìn lại win rate và lỗi lặp lại.",
    href: "/journal",
  },
  {
    icon: LineChart,
    title: "Dashboard thị trường",
    text: "Top coin và trend score tham khảo. Dữ liệu công khai, không phải tín hiệu entry.",
    href: "/dashboard",
  },
  {
    icon: ListChecks,
    title: "Tư duy phòng thủ",
    text: "Đặt câu hỏi “setup sai khi nào” thay vì “giá pump tới đâu”.",
    href: "/dashboard",
  },
] as const;

const pricingPlans = [
  {
    name: "Beta — Early Access",
    price: "0đ trong giai đoạn thử",
    detail: "Ưu tiên 200 trader futures đăng ký waitlist đầu tiên.",
    highlights: ["Phân tích rủi ro + AI review", "Journal & watchlist", "Dashboard thị trường"],
  },
  {
    name: "Pro",
    price: "Ra mắt sau beta",
    detail: "Dành cho trader cần lịch sử phân tích sâu và báo cáo rủi ro định kỳ.",
    highlights: ["Giới hạn phân tích cao hơn", "Báo cáo rủi ro tuần", "Ưu tiên tính năng mới"],
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto grid min-h-[92vh] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div className="max-w-2xl">
            <Badge variant="outline" className="border-primary/35 bg-primary/10 text-primary">
              Trợ lý rủi ro AI · Crypto futures
            </Badge>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.1] sm:text-6xl">
              Đừng để đòn bẩy quyết định thay bạn.
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              <span className="font-medium text-foreground">TradeGuard AI</span> không phải nhóm tín
              hiệu. Không phải bot báo giá sẽ x100. Đây là lớp kiểm tra rủi ro trước lệnh:
              liquidation, R:R, sizing và kỷ luật — dành cho trader futures crypto Việt Nam.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-primary text-primary-foreground">
                <Link href="/register">
                  Tham gia waitlist <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/analyze">Dùng thử máy tính rủi ro</Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              {["Không kêu long / short", "Không hứa win rate", "Không trade hộ"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-xl border border-border bg-card/80 p-4 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ví dụ phân tích</p>
                  <p className="mt-1 font-mono text-xl font-semibold">BTC · Long · 10x</p>
                </div>
                <Badge variant="outline" className="border-amber-400/35 text-amber-200">
                  Rủi ro cao
                </Badge>
              </div>

              <div className="grid gap-3 py-4 sm:grid-cols-3">
                {[
                  { label: "Thanh lý ước tính", value: "$58,500" },
                  { label: "R:R (SL → TP)", value: "1 : 2.1" },
                  { label: "Risk nếu chạm SL", value: "$42" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-border bg-background/55 p-3"
                  >
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="mt-2 text-lg font-semibold text-sky-200">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-amber-400/20 bg-amber-400/8 p-4">
                <div className="flex gap-2">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-300" />
                  <p className="text-sm leading-6 text-muted-foreground">
                    Leverage 10x: biến động nhỏ cũng có thể kích liquidation. Đây là thông tin rủi
                    ro, không phải lời mời vào lệnh.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex h-28 items-end gap-1.5">
                {[38, 52, 44, 61, 72, 55, 48, 66, 58, 74, 50, 43].map((bar, index) => (
                  <div
                    key={`${bar}-${index}`}
                    className="flex-1 rounded-t bg-primary/70"
                    style={{ height: `${clampPercent(bar)}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="border-b border-border bg-card/25">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-primary">Nỗi đau thực tế</p>
            <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">
              Sàn cho bạn vào lệnh nhanh. Rủi ro thì đến sau.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Trader futures thua không phải vì thiếu indicator — mà vì thiếu một bước kiểm tra
              trước khi khóa margin.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {painPoints.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-xl border border-border bg-card/70 p-5"
                >
                  <Icon className="size-5 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Cách hoạt động</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">3 bước trước khi bấm Confirm</h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            TradeGuard không thay terminal Binance/Bybit của bạn. Nó bổ sung một lớp “pause & check
            risk” trước khi bạn cam kết tiền.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {steps.map((item) => (
            <article key={item.step} className="rounded-xl border border-border bg-card/70 p-5">
              <span className="font-mono text-sm text-primary">{item.step}</span>
              <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Key features */}
      <section className="border-y border-border bg-card/25">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-primary">Tính năng chính</p>
            <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">
              Workspace cho rủi ro — không cho hype
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Mọi module đều trả lời cùng một câu hỏi: “Nếu setup này sai, tôi mất gì và thoát khi
              nào?”
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.title}
                  className="rounded-xl border-border/80 bg-card/78 transition-colors hover:border-primary/30"
                >
                  <CardHeader>
                    <Icon className="size-5 text-primary" />
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <CardDescription className="leading-6">{item.text}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      Mở module <ArrowRight className="size-3.5" />
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing waitlist */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-medium text-primary">Bảng giá & waitlist</p>
            <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">
              Đăng ký sớm — dùng beta miễn phí
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Đang mở beta cho trader muốn xây thói quen kiểm tra rủi ro trước mỗi lệnh. Chúng tôi
              không hứa lợi nhuận — chỉ cam kết minh bạch phạm vi sản phẩm.
            </p>

            <form action="/register" className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Input
                type="email"
                name="email"
                placeholder="email@example.com"
                className="sm:flex-1"
                aria-label="Email đăng ký waitlist"
              />
              <Button type="submit" size="lg" className="shrink-0">
                Vào waitlist
              </Button>
            </form>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Chuyển tới trang đăng ký. Xác nhận email xong là vào được workspace.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {pricingPlans.map((plan) => (
              <Card key={plan.name} className="rounded-xl border-border/80 bg-card/78">
                <CardHeader className="border-b border-border">
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription className="text-base font-medium text-foreground">
                    {plan.price}
                  </CardDescription>
                  <p className="text-sm leading-6 text-muted-foreground">{plan.detail}</p>
                </CardHeader>
                <CardContent className="space-y-2 pt-4">
                  {plan.highlights.map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex gap-4 rounded-xl border border-border bg-background/50 p-5 sm:p-6">
            <ShieldCheck className="mt-1 size-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">Tuyên bố miễn trừ trách nhiệm</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {TRADEGUARD_DISCLAIMER}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild variant="outline" size="sm">
                  <Link href="/login">Đăng nhập</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">
                    Tạo tài khoản <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
