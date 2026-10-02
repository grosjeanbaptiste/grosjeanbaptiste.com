import { describe, expect, it } from 'vitest';
import { Period } from './period';

const today = new Date('2026-10-01');

describe('Period', () => {
  it('reads an ISO start date down to the month', () => {
    expect(Period.of('2022-10-15', '2026-09-04').start).toEqual({ year: 2022, month: 10 });
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
