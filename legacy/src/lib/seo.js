import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Public (crawlable) pages. The signed-in app is intentionally excluded.
const PUBLIC_BASES = ['/', '/login', '/signup'];

// Parse a pathname into its English "base" + whether it's the French (/fr) variant.
export function parsePublicPath(pathname) {
  let fr = false;
  let p = pathname;
  if (p === '/fr' || p.startsWith('/fr/')) {
    fr = true;
    p = p.slice(3) || '/';
  }
  if (!p) p = '/';
  return PUBLIC_BASES.includes(p) ? { isPublic: true, base: p, fr } : { isPublic: false };
}

// Build the localized path for a base + language.
export function localizedPath(base, lang) {
  if (lang === 'fr') return base === '/' ? '/fr' : `/fr${base}`;
  return base;
}

function upsert(selector, create) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
}

// Keep <link rel=canonical>, og:url and hreflang alternates in sync with the
// current public route. URLs are derived from the live origin, so they're
// correct in any environment without hard-coding a domain.
export function usePublicSeo() {
  const { pathname } = useLocation();
  useEffect(() => {
    const info = parsePublicPath(pathname);
    if (!info.isPublic) return;

    const origin = window.location.origin;
    const enUrl = origin + info.base;
    const frUrl = origin + localizedPath(info.base, 'fr');
    const current = info.fr ? frUrl : enUrl;

    upsert('link[rel="canonical"]', () => {
      const l = document.createElement('link');
      l.setAttribute('rel', 'canonical');
      return l;
    }).setAttribute('href', current);

    upsert('meta[property="og:url"]', () => {
      const m = document.createElement('meta');
      m.setAttribute('property', 'og:url');
      return m;
    }).setAttribute('content', current);

    document.head.querySelectorAll('link[data-hreflang]').forEach((n) => n.remove());
    [
      ['en', enUrl],
      ['fr', frUrl],
      ['x-default', enUrl],
    ].forEach(([hreflang, href]) => {
      const l = document.createElement('link');
      l.setAttribute('rel', 'alternate');
      l.setAttribute('hreflang', hreflang);
      l.setAttribute('href', href);
      l.setAttribute('data-hreflang', '');
      document.head.appendChild(l);
    });
  }, [pathname]);
}
