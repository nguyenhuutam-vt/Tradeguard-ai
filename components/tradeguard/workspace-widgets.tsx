import type { ReactNode } from "react";

import type { MetricTone, RiskTone } from "@/lib/tradeguard/domain";
import { clampPercent } from "@/lib/tradeguard/domain";
import { cn } from "@/lib/utils";

const metricToneClasses: Record<MetricTone, string> = {
  neutral: "text-sky-200",
  good: "text-emerald-300",
  warn: "text-amber-300",
  danger: "text-red-300",
};

const riskToneClasses: Record<RiskTone, string> = {
  good: "bg-emerald-400",
  warn: "bg-amber-400",
  danger: "bg-red-400",
  info: "bg-sky-400",
};

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="mb-2 text-sm font-medium text-primary">{eyebrow}</p>
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>
      </div>
      {action ? <div className="flex shrink-0 gap-2">{action}</div> : null}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: MetricTone;
}) {
  return (
    <div className="rounded-lg border border-border bg-card/78 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={cn("mt-3 text-2xl font-semibold", metricToneClasses[tone])}>{value}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>
    </div>
  );
}

export function RiskBar({
  label,
  value,
  tone = "good",
}: {
  label: string;
  value: number;
  tone?: RiskTone;
}) {
  const boundedValue = clampPercent(value);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{boundedValue}/100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", riskToneClasses[tone])}
          style={{ width: `${boundedValue}%` }}
        />
      </div>
    </div>
  );
}

export function MiniSparkline({ bars }: { bars: readonly number[] }) {
  return (
    <div className="flex h-24 items-end gap-1">
      {bars.map((bar, index) => {
        const boundedBar = clampPercent(bar);

        return (
          <div
            key={`${bar}-${index}`}
            className="flex-1 rounded-t bg-primary/75"
            style={{ height: `${boundedBar}%` }}
          />
        );
      })}
    </div>
  );
}
