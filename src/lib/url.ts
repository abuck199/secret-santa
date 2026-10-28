// Link helpers shared by the UI and the server (ported from the old app). The
// server re-runs normalizeUrl on every saved link, so the client check is only
// for quick feedback.

// Returns null for empty input, false for an invalid/unsafe link, otherwise a
// safe absolute http(s) URL (https:// is added when the scheme is missing).
export function normalizeUrl(url: string | null | undefined): string | null | false {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();

  const lower = trimmed.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:')) return false;

  const candidate =
    lower.startsWith('http://') || lower.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;

  try {
    const u = new URL(candidate);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
    if (!u.hostname.includes('.')) return false;
    if (u.hostname.startsWith('.') || u.hostname.endsWith('.')) return false;
    return candidate;
  } catch {
    return false;
  }
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}
