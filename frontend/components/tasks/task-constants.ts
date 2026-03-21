export { durationBetween as formatDuration, estimateRemaining as estimateEta } from "@/lib/time";

export const statusLabel: Record<string, string> = {
  completed: "已完成",
  running: "运行中",
  failed: "失败",
  pending: "等待中",
  paused: "已暂停",
  cancelled: "已取消",
};

export const statusBadgeVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline" | "warning"
> = {
  completed: "default",
  running: "secondary",
  failed: "destructive",
  pending: "outline",
  paused: "outline",
  cancelled: "warning",
};
