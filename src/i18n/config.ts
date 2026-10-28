// Language routing. Visible URLs carry no language (`/app/list`): the proxy
// picks it from the `lang` cookie or the browser and rewrites internally to
// `app/[lang]/...`. Public pages also exist under `/fr/...` so search engines
// (which send no Accept-Language) can index the French version.

export const LOCALES = ['en', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

// Explicit choice made with the language toggle; read by the proxy and by the
// OTP email. Replaces the old app's `thatwish:lang` localStorage key.
export const LANG_COOKIE = 'lang';

// Pages with a crawlable `/fr` twin (listed in the sitemap with hreflang).
export const PUBLIC_PATHS = ['/', '/login', '/privacy', '/terms'];

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

// The browser's preferred supported language from an Accept-Language header,
// honoring its order/weights: 'es, fr;q=0.9, en;q=0.8' -> 'fr'. Anything else
// (or no header, e.g. crawlers) -> English.
export function localeFromAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;
  const ranked = header
    .split(',')
    .map((part, i) => {
      const [tag, ...params] = part.trim().toLowerCase().split(';');
      const q = Number(params.find((p) => p.trim().startsWith('q='))?.split('=')[1] ?? 1);
      return { lang: tag.split('-')[0], q: Number.isNaN(q) ? 0 : q, i };
    })
    .sort((a, b) => b.q - a.q || a.i - b.i);
  return ranked.map((r) => r.lang).find(isLocale) ?? DEFAULT_LOCALE;
}

// Strip a `/fr` (or `/en`) prefix: '/fr/app' -> '/app', '/fr' -> '/'.
export function stripLocale(pathname: string): string {
  const m = pathname.match(/^\/(en|fr)(\/.*)?$/);
  return m ? m[2] || '/' : pathname;
}

// The crawlable URL of a public page in `lang` (SEO only: canonical, hreflang,
// sitemap). In-app links use plain paths.
export function localizedPath(path: string, lang: Locale): string {
  const base = stripLocale(path);
  if (lang === DEFAULT_LOCALE) return base;
  return base === '/' ? `/${lang}` : `/${lang}${base}`;
}
