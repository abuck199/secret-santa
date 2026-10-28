'use client';

import { useSyncExternalStore } from 'react';
import { LANG_COOKIE, isLocale, localeFromAcceptLanguage, type Locale } from '@/i18n/config';
import { getDict, makeT } from '@/i18n/translate';
import ErrorScreen from './ErrorScreen';

// The global 404 is one static page for every visitor, so the language is
// picked in the browser with the proxy's rule: the `lang` cookie, else the
// browser's preferences.
function browserLang(): Locale {
  const cookie = document.cookie.match(new RegExp(`(?:^|; )${LANG_COOKIE}=(\\w+)`))?.[1];
  if (isLocale(cookie)) return cookie;
  return localeFromAcceptLanguage(navigator.languages.join(','));
}

const noSubscribe = () => () => {};

export default function NotFoundContent() {
  const lang = useSyncExternalStore(noSubscribe, browserLang, () => 'en' as Locale);
  const t = makeT(getDict(lang));
  return (
    <ErrorScreen code="404" title={t('err.notFoundTitle')} text={t('err.notFoundText')} homeLabel={t('err.home')} />
  );
}
