// Value object: the span of an entry, at month granularity — the resolution
// the CV is written at. "Today" is always passed in; the domain reads no clock.

export interface YearMonth {
  readonly year: number;
  readonly month: number;
}

const ISO = /^(\d{4})(?:-(\d{2}))?(?:-\d{2})?$/;

function parse(text: string): YearMonth {
  const match = ISO.exec(text);
  if (!match) throw new Error(`Unreadable date "${text}" (expected YYYY, YYYY-MM or YYYY-MM-DD)`);
  return { year: Number(match[1]), month: match[2] ? Number(match[2]) : 1 };
}

const ordinal = (ym: YearMonth): number => ym.year * 12 + (ym.month - 1);

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
