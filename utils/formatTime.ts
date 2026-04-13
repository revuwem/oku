export function formatTime(seconds: number): string {
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const padded = (n: number) => String(n).padStart(2, "0");
  if (h > 0) return `${h}:${padded(m)}:${padded(sec)}`;
  return `${m}:${padded(sec)}`;
}
