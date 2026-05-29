import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TradeGuard AI | Trợ lý quản trị rủi ro crypto",
  description:
    "Trợ lý AI giúp nhà đầu tư crypto phân tích rủi ro, kỷ luật giao dịch và quản lý mức độ phơi nhiễm.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
