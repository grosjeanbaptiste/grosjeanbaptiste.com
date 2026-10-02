import type { Period, YearMonth } from '../domain/period';

const monthYear = (ym: YearMonth, lang: string) =>
  new Intl.DateTimeFormat(lang, { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    Date.UTC(ym.year, ym.month - 1, 1),
  );

const same = (a: YearMonth, b: YearMonth) => a.year === b.year && a.month === b.month;

export function formatPeriod(period: Period, lang: string, ongoing: string): string {
  const start = monthYear(period.start, lang);
  if (!period.end) return `${start} – ${ongoing}`;
  if (same(period.start, period.end)) return start;
  return `${start} – ${monthYear(period.end, lang)}`;
}
