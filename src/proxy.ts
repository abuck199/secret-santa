// Language routing only (auth is checked in src/server, never here).
//
//  /...            -> served in the `lang` cookie's language, else the browser's
//                     (rewritten to /en/... or /fr/...; the URL doesn't change)
//  /fr/<public>    -> the crawlable French twin of a public page, served as is
//  /fr/<other>     -> redirected to the plain URL (old /fr/... app links)
//  /en/...         -> redirected to the plain URL
// Arriving through any /fr URL without a cookie remembers French, so the
// visitor stays in French as they click around.

import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse, type NextRequest } from 'next/server';
import {
  LANG_COOKIE,
  PUBLIC_PATHS,
  isLocale,
  localeFromAcceptLanguage,
  stripLocale,
} from '@/i18n/config';

const ONE_YEAR = 60 * 60 * 24 * 365;

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const cookie = req.cookies.get(LANG_COOKIE)?.value;
  const prefix = pathname.match(/^\/(en|fr)(?:\/|$)/)?.[1];

  if (prefix) {
    const plain = stripLocale(pathname);
    const res = prefix === 'fr' && PUBLIC_PATHS.includes(plain)
      ? NextResponse.next()
      : NextResponse.redirect(new URL(plain + search, req.url));
    if (prefix === 'fr' && !isLocale(cookie)) {
      res.cookies.set(LANG_COOKIE, 'fr', { path: '/', maxAge: ONE_YEAR, sameSite: 'lax' });
    }
    return res;
  }

  // Optimistic auth redirects on cookie presence only (the real check is in
  // src/server): signed-in visitors skip the landing page, signed-out ones go
  // straight to /login instead of streaming the app shell first. A stale
  // cookie still reaches /app, whose session check sends them to /login.
  const hasSession = !!getSessionCookie(req);
  if (pathname === '/' && hasSession) {
    return NextResponse.redirect(new URL('/app', req.url));
  }
  if (!hasSession && /^\/(app|join|welcome|start)(\/|$)/.test(pathname)) {
    const login = new URL('/login', req.url);
    login.searchParams.set('next', pathname + search);
    return NextResponse.redirect(login);
  }

  const lang = isLocale(cookie) ? cookie : localeFromAcceptLanguage(req.headers.get('accept-language'));
  const res = NextResponse.rewrite(new URL(`/${lang}${pathname === '/' ? '' : pathname}${search}`, req.url));
  // Same URL, different content per language: keep shared caches honest.
  res.headers.set('Vary', 'Cookie, Accept-Language');
  return res;
}

export const config = {
  // Pages only: skip API routes, Next internals and files in public/ (anything
  // with a dot, e.g. /favicon.svg, /robots.txt).
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
