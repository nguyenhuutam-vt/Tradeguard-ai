export type WorkspaceUser = {
  name: string;
  role: string;
  plan: string;
};

export type MetricTone = "neutral" | "good" | "warn" | "danger";
export type RiskTone = "good" | "warn" | "danger" | "info";

export function clampPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
}
