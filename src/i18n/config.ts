// Language routing. English has no URL prefix (`/app/list`), French lives under
// `/fr` (`/fr/app/list`). Internally every page is under `app/[lang]`; the
// proxy rewrites unprefixed URLs to `/en/...`.

export const LOCALES = ['en', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

// Explicit choice made with the language toggle; read by the proxy and by the
// OTP email. Replaces the old app's `thatwish:lang` localStorage key.
export const LANG_COOKIE = 'lang';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

// Strip a `/fr` (or `/en`) prefix: '/fr/app' -> '/app', '/fr' -> '/'.
export function stripLocale(pathname: string): string {
  const m = pathname.match(/^\/(en|fr)(\/.*)?$/);
  return m ? m[2] || '/' : pathname;
}

// The public URL of `path` in `lang`: ('/app', 'fr') -> '/fr/app'.
export function localizedPath(path: string, lang: Locale): string {
  const base = stripLocale(path);
  if (lang === DEFAULT_LOCALE) return base;
  return base === '/' ? `/${lang}` : `/${lang}${base}`;
}
