// Birthday helpers. Birthdays are stored as 'YYYY-MM-DD' (a plain date), so we
// parse the parts directly to avoid timezone drift from new Date(string).

import type { TFunction } from '@/i18n/translate';

export function parseDateParts(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  const [y, m, d] = String(dateStr).split('-').map(Number);
  if (!y || !m || !d) return null;
  return { y, m, d };
}

// Days until the next occurrence of this month/day (0 = today).
export function daysUntilBirthday(dateStr: string | null | undefined, from = new Date()): number | null {
  const parts = parseDateParts(dateStr);
  if (!parts) return null;
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let next = new Date(today.getFullYear(), parts.m - 1, parts.d);
  if (next < today) next = new Date(today.getFullYear() + 1, parts.m - 1, parts.d);
  return Math.round((next.getTime() - today.getTime()) / 86400000);
}

// Christmas is an event for every group, shown among the birthdays.
export const CHRISTMAS = '2000-12-25';

export function daysUntilChristmas(from = new Date()): number {
  return daysUntilBirthday(CHRISTMAS, from) ?? 0;
}

// Age the person will turn at their next birthday (null if year unknown/0).
export function ageTurningNext(dateStr: string | null | undefined, from = new Date()): number | null {
  const parts = parseDateParts(dateStr);
  if (!parts) return null;
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let nextYear = today.getFullYear();
  const thisYears = new Date(today.getFullYear(), parts.m - 1, parts.d);
  if (thisYears < today) nextYear += 1;
  return nextYear - parts.y;
}

// "today!", "tomorrow", "in 12 days".
export function whenLabel(t: TFunction, days: number): string {
  if (days === 0) return t('dash.birthdayToday');
  if (days === 1) return t('dash.birthdayTomorrow');
  return t('dash.birthdayInDays', { days });
}

export function formatBirthday(dateStr: string | null | undefined, lang = 'en'): string {
  const parts = parseDateParts(dateStr);
  if (!parts) return '';
  const date = new Date(2000, parts.m - 1, parts.d);
  try {
    return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-CA' : 'en-US', {
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return `${parts.m}/${parts.d}`;
  }
}
