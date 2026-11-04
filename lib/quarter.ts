/**
 * "Q4 2026" for a date, by the studio's clock (India time). Used for the
 * "Taking on new projects" line, which used to be a fixed "Q4 2026" and would
 * have gone stale on 1 January.
 */
export function quarterLabel(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(date);
  const year = parts.find((p) => p.type === 'year')?.value ?? String(date.getFullYear());
  const month = Number(parts.find((p) => p.type === 'month')?.value ?? date.getMonth() + 1);
  return `Q${Math.ceil(month / 3)} ${year}`;
}
