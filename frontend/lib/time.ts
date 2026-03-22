import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";
import "dayjs/locale/zh-cn";

dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.locale("zh-cn");

/**
 * "3 分钟前", "刚刚", "2 小时后" etc.
 */
export function timeAgo(ts: string | null | undefined): string {
  if (!ts) return "—";
  // Treat naive timestamps as UTC
  const d = ts.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(ts) ? ts : ts + "Z";
  return dayjs(d).fromNow();
}

/**
 * "2 分 30 秒", "1 小时 5 分", "45 秒" etc.
 * Formats a duration in seconds into human-readable Chinese.
 */
export function formatDurationSemantic(seconds: number): string {
  const dur = dayjs.duration(seconds, "seconds");
  const h = Math.floor(dur.asHours());
  const m = dur.minutes();
  const s = dur.seconds();
  if (h > 0) return `${h} 小时 ${m} 分`;
  if (m > 0) return `${m} 分 ${s} 秒`;
  return `${s} 秒`;
}

/**
 * Compute duration between two timestamps and format semantically.
 */
export function durationBetween(
  start: string | null,
  end: string | null,
): string {
  if (!start) return "—";
  const s = start.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(start) ? start : start + "Z";
  const e = end
    ? (end.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(end) ? end : end + "Z")
    : new Date().toISOString();
  const diff = Math.max(0, dayjs(e).diff(dayjs(s), "second"));
  return formatDurationSemantic(diff);
}

/**
 * Estimate remaining time from elapsed + progress.
 * Returns null if < 60s elapsed or < 1% progress.
 */
export function estimateRemaining(
  startedAt: string | null,
  progressPct: number,
): string | null {
  if (!startedAt || progressPct < 1) return null;
  const s = startedAt.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(startedAt) ? startedAt : startedAt + "Z";
  const elapsed = dayjs().diff(dayjs(s), "second");
  if (elapsed < 60) return null;
  const remaining = (elapsed / progressPct) * (100 - progressPct);
  return `约 ${formatDurationSemantic(Math.round(remaining))}`;
}

/**
 * Format a timestamp to localized display: "2026-03-21 10:30"
 */
export function formatTime(ts: string | null | undefined): string {
  if (!ts) return "—";
  const d = ts.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(ts) ? ts : ts + "Z";
  return dayjs(d).format("YYYY-MM-DD HH:mm");
}
