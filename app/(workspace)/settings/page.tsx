import { BellRing, SlidersHorizontal, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/tradeguard/workspace-widgets";
import { saveSettings } from "../actions";

export default function SettingsPage() {
  return (
    <form action={saveSettings}>
      <PageHeader
        eyebrow="Cài đặt"
        title="Hồ sơ phòng thủ và ngưỡng cảnh báo"
        description="Quản lý hồ sơ hiển thị và các ngưỡng cảnh báo cho phiên đăng nhập hiện tại."
        action={<Button variant="outline">Lưu thay đổi</Button>}
      />

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="rounded-lg bg-card/78">
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-3">
              <UserRound className="size-5 text-primary" />
              <CardTitle>Hồ sơ người dùng</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên hiển thị</Label>
              <Input id="name" name="name" defaultValue="Minh Anh" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Vai trò</Label>
              <Input id="role" name="role" defaultValue="Trader phòng thủ" />
            </div>
            <Badge variant="outline" className="w-fit text-primary">
              Supabase Auth
            </Badge>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="rounded-lg bg-card/78">
            <CardHeader className="border-b border-border">
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="size-5 text-primary" />
                <CardTitle>Ngưỡng rủi ro</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                ["Cảnh báo vàng", "60/100"],
                ["Cảnh báo đỏ", "75/100"],
                ["Tỷ trọng tài sản tối đa", "25%"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background/45 p-3"
                >
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-lg bg-card/78">
            <CardHeader className="border-b border-border">
              <div className="flex items-center gap-3">
                <BellRing className="size-5 text-primary" />
                <CardTitle>Thông báo</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Cảnh báo risk score tăng đột biến",
                "Nhắc ghi nhật ký sau giao dịch",
                "Theo dõi sự kiện với tài sản trong watchlist",
              ].map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background/45 p-3 text-sm"
                >
                  <input
                    type="checkbox"
                    name="notifications"
                    value={item}
                    defaultChecked
                    className="size-4 accent-emerald-400"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
