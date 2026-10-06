// Value object: the span of an entry. The CV speaks in months — durations,
// "which years" — and a time axis places it to the day when the CV gives one.
// "Today" is always passed in; the domain reads no clock.

export interface YearMonth {
  readonly year: number;
  readonly month: number;
  // The day, when the CV dates the entry that precisely.
  readonly day?: number;
}

const ISO = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/;

function parse(text: string): YearMonth {
  const match = ISO.exec(text);
  if (!match) throw new Error(`Unreadable date "${text}" (expected YYYY, YYYY-MM or YYYY-MM-DD)`);
  const month = { year: Number(match[1]), month: match[2] ? Number(match[2]) : 1 };
  return match[3] ? { ...month, day: Number(match[3]) } : month;
}

const ordinal = (ym: YearMonth): number => ym.year * 12 + (ym.month - 1);

// Where a date falls on a time axis, in months and to the day: the 15th of a
// 30-day month is 14/30 of the way in. Without a day, the first.
const daysIn = (ym: YearMonth) => new Date(Date.UTC(ym.year, ym.month, 0)).getUTCDate();
const instant = (ym: YearMonth): number => ordinal(ym) + (ym.day ? (ym.day - 1) / daysIn(ym) : 0);
const A_DAY = 1 / 31;

export const monthOf = (date: Date): YearMonth => ({
  year: date.getUTCFullYear(),
  month: date.getUTCMonth() + 1,
});

export class Period {
  private constructor(
    readonly start: YearMonth,
    readonly end: YearMonth | null,
  ) {}

  static of(start: string, end?: string): Period {
    const from = parse(start);
    const to = end ? parse(end) : null;
    if (to && ordinal(to) < ordinal(from)) {
      throw new Error(`Period ends (${end}) before it starts (${start})`);
    }
    return new Period(from, to);
  }

  static newestFirst(a: Period, b: Period): number {
    return ordinal(b.start) - ordinal(a.start);
  }

  get ongoing(): boolean {
    return this.end === null;
  }

  endOrToday(today: Date): YearMonth {
    return this.end ?? monthOf(today);
  }

  months(today: Date): number {
    return ordinal(this.endOrToday(today)) - ordinal(this.start) + 1;
  }

  // Where the period starts on a time axis (months since year 0, to the day).
  startsAt(): number {
    return instant(this.start);
  }

  // Where it stops. Dated to the month, it covers its last month, as does an
  // ongoing one the current month. Dated to the day, it stops as its last day
  // begins — an entry that begins the day another ends follows it without
  // overlapping — and is never shorter than a day.
  stopsAt(today: Date): number {
    if (!this.end) return ordinal(monthOf(today)) + 1;
    if (!this.end.day) return ordinal(this.end) + 1;
    return Math.max(instant(this.end), this.startsAt() + A_DAY);
  }

  covers(month: YearMonth, today: Date): boolean {
    const at = ordinal(month);
    return at >= ordinal(this.start) && at <= ordinal(this.endOrToday(today));
  }
}

// The period of a dated CV record; undefined when the record carries no start.
export const periodOf = (record: {
  readonly startDate?: string;
  readonly endDate?: string;
}): Period | undefined =>
  record.startDate ? Period.of(record.startDate, record.endDate) : undefined;
