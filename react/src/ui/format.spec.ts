import { describe, expect, it } from 'vitest';
import { Period } from '../domain/period';
import { formatPeriod } from './format';

describe('formatPeriod', () => {
  it('shows month and year at both ends, in the reader’s language', () => {
    expect(formatPeriod(Period.of('2023-01-01', '2024-06-30'), 'fr', 'aujourd’hui')).toBe(
      'janv. 2023 – juin 2024',
    );
  });

  it('closes an ongoing period with the word for “present”', () => {
    expect(formatPeriod(Period.of('2025-07-01'), 'en', 'present')).toBe('Jul 2025 – present');
  });

  it('shows a single month once', () => {
    expect(formatPeriod(Period.of('2019-02-01', '2019-02-28'), 'en', 'present')).toBe('Feb 2019');
  });
});
