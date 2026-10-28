// Birthday helpers. Birthdays are stored as 'YYYY-MM-DD' (a plain date), so we
// parse the parts directly to avoid timezone drift from new Date(string).

export function parseDateParts(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = String(dateStr).split('-').map(Number);
  if (!y || !m || !d) return null;
  return { y, m, d };
}

// Days until the next occurrence of this month/day (0 = today).
export function daysUntilBirthday(dateStr, from = new Date()) {
  const parts = parseDateParts(dateStr);
  if (!parts) return null;
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let next = new Date(today.getFullYear(), parts.m - 1, parts.d);
  if (next < today) next = new Date(today.getFullYear() + 1, parts.m - 1, parts.d);
  return Math.round((next - today) / 86400000);
}

// Age the person will turn at their next birthday (null if year unknown/0).
export function ageTurningNext(dateStr, from = new Date()) {
  const parts = parseDateParts(dateStr);
  if (!parts) return null;
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let nextYear = today.getFullYear();
  const thisYears = new Date(today.getFullYear(), parts.m - 1, parts.d);
  if (thisYears < today) nextYear += 1;
  return nextYear - parts.y;
}

export function formatBirthday(dateStr, lang = 'en') {
  const parts = parseDateParts(dateStr);
  if (!parts) return '';
  const date = new Date(2000, parts.m - 1, parts.d);
  try {
    return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-CA' : 'en-US', {
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch (_) {
    return `${parts.m}/${parts.d}`;
  }
}
