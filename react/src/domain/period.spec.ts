import { describe, expect, it } from 'vitest';
import { Period } from './period';

const today = new Date('2026-10-01');

describe('Period', () => {
  it('reads an ISO start date, with its day when the CV gives one', () => {
    expect(Period.of('2022-10-15', '2026-09-04').start).toEqual({ year: 2022, month: 10, day: 15 });
  });

  it('reads a date given to the month as that month', () => {
    expect(Period.of('2022-10').start).toEqual({ year: 2022, month: 10 });
  });

  it('stops as its last day begins, so that a period starting that day follows it', () => {
    const first = Period.of('2018-09-30', '2022-10-15');
    const next = Period.of('2022-10-15', '2026-09-04');
    expect(first.stopsAt(new Date('2026-10-01'))).toBe(next.startsAt());
  });

  it('covers its whole last month when dated to the month', () => {
    const period = Period.of('2024-03', '2024-05');
    expect(period.stopsAt(new Date('2026-10-01')) - period.startsAt()).toBe(3);
  });

  it('is never shorter than a day', () => {
    const period = Period.of('2024-03-10', '2024-03-10');
    expect(period.stopsAt(new Date('2026-10-01'))).toBeGreaterThan(period.startsAt());
  });

  it('is ongoing when it has no end date', () => {
    expect(Period.of('2025-07-01').ongoing).toBe(true);
  });

  it('counts months inclusively, so a single-month internship lasts one month', () => {
    expect(Period.of('2019-02-01', '2019-02-28').months(today)).toBe(1);
  });

  it('counts an ongoing period up to today', () => {
    expect(Period.of('2025-07-01').months(today)).toBe(16);
  });

  it('accepts a year-only date as January', () => {
    expect(Period.of('2018').start).toEqual({ year: 2018, month: 1 });
  });

  it('rejects a date it cannot read instead of inventing one', () => {
    expect(() => Period.of('soon')).toThrow(/soon/);
  });

  it('rejects an end before its start', () => {
    expect(() => Period.of('2024-05-01', '2023-01-01')).toThrow(/before/);
  });

  it('orders the most recent start first', () => {
    const older = Period.of('2019-01-01');
    const newer = Period.of('2024-01-01');
    expect([older, newer].sort(Period.newestFirst)).toEqual([newer, older]);
  });

  it('knows whether it covers a given month', () => {
    expect(Period.of('2023-01-01', '2023-12-31').covers({ year: 2023, month: 6 }, today)).toBe(
      true,
    );
  });
});
