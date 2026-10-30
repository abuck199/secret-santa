import { describe, expect, it } from 'vitest';
import { daysUntilBirthday, daysUntilChristmas } from '@/lib/dates';

describe('daysUntilChristmas', () => {
  it('counts down to this year’s Christmas', () => {
    expect(daysUntilChristmas(new Date(2026, 9, 29))).toBe(57);
    expect(daysUntilChristmas(new Date(2026, 11, 24))).toBe(1);
  });

  it('is 0 on the day, then rolls over to next year', () => {
    expect(daysUntilChristmas(new Date(2026, 11, 25, 23, 30))).toBe(0);
    expect(daysUntilChristmas(new Date(2026, 11, 26))).toBe(364);
  });

  it('sorts against birthdays on the same scale', () => {
    const from = new Date(2026, 9, 29);
    // A January birthday comes after Christmas, a November one before.
    expect(daysUntilBirthday('1990-01-10', from)).toBeGreaterThan(daysUntilChristmas(from));
    expect(daysUntilBirthday('1990-11-15', from)).toBeLessThan(daysUntilChristmas(from));
  });
});
