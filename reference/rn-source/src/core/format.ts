// src/core/format.ts

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const two = (n: number): string => String(n).padStart(2, '0');

export function formatTime(t: Date): string {
  return `${two(t.getHours())}:${two(t.getMinutes())}`;
}

export function formatDateTime(t: Date): string {
  return `${t.getDate()} ${MONTHS[t.getMonth()]} ${t.getFullYear()}, ${formatTime(t)}`;
}

const startOfDay = (d: Date): number => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** "Today", "Yesterday" or "24 Oct 2026" for the History list headers. */
export function dayHeader(t: Date, now: Date = new Date()): string {
  const diff = Math.round((startOfDay(now) - startOfDay(t)) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return `${t.getDate()} ${MONTHS[t.getMonth()]} ${t.getFullYear()}`;
}

/** "just now", "12 s ago", "5 min ago", "2 h ago". */
export function ago(t: Date | number | null | undefined, now: number = Date.now()): string {
  if (t == null) return 'never';
  const s = Math.floor((now - (typeof t === 'number' ? t : t.getTime())) / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return `${s} s ago`;
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}

/** Distance is approximate, so show whole metres (or "< 1 m"). */
export function formatMetres(m: number | null | undefined): string {
  if (m == null) return '-';
  if (m < 1) return '< 1 m';
  return `${Math.round(m)} m`;
}
