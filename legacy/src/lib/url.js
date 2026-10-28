// Normalize a user-entered link. Returns:
//   null  -> empty input (no link)
//   false -> invalid / unsafe
//   string -> a safe absolute https URL
export function normalizeUrl(url) {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();

  const lower = trimmed.toLowerCase();
  // eslint-disable-next-line no-script-url
  if (lower.startsWith('javascript:') || lower.startsWith('data:')) return false;

  const candidate =
    trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;

  try {
    const u = new URL(candidate);
    if (!u.hostname.includes('.')) return false;
    if (u.hostname.startsWith('.') || u.hostname.endsWith('.')) return false;
    return candidate;
  } catch (_) {
    return false;
  }
}

export function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch (_) {
    return url;
  }
}
