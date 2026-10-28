// Language routing only (auth is checked in src/server, never here).
//
//  /fr/...  -> served as is (the `[lang]` segment is `fr`)
//  /en/...  -> redirected to the unprefixed URL (one canonical English URL)
//  /...     -> French if the `lang` cookie says so, or on a first visit from a
//              browser that isn't set to English (old app's rule: Quebec
//              audience, French by default); otherwise rewritten to /en/...
//              Requests without Accept-Language (crawlers) get English.

import { NextResponse, type NextRequest } from 'next/server';
import { LANG_COOKIE, isLocale, localizedPath } from '@/i18n/config';

function preferredLang(req: NextRequest) {
  const cookie = req.cookies.get(LANG_COOKIE)?.value;
  if (isLocale(cookie)) return cookie;
  const header = req.headers.get('accept-language');
  if (!header) return 'en';
  return header.toLowerCase().startsWith('en') ? 'en' : 'fr';
}

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (pathname === '/fr' || pathname.startsWith('/fr/')) return NextResponse.next();

  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return NextResponse.redirect(new URL(localizedPath(pathname, 'en') + search, req.url));
  }

  if (preferredLang(req) === 'fr') {
    return NextResponse.redirect(new URL(localizedPath(pathname, 'fr') + search, req.url));
  }
  return NextResponse.rewrite(new URL(`/en${pathname === '/' ? '' : pathname}${search}`, req.url));
}

export const config = {
  // Pages only: skip API routes, Next internals and files in public/ (anything
  // with a dot, e.g. /favicon.svg, /robots.txt).
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
