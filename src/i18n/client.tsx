'use client';

// Translations in Client Components. The root layout hands over the current
// language's dictionary once; components call useI18n() like in the old app.

import { createContext, use, useMemo, type ReactNode } from 'react';
import { DEFAULT_LOCALE, type Locale } from './config';
import { makeT, type Dict, type TFunction } from './translate';

type I18n = { lang: Locale; t: TFunction };

const I18nContext = createContext<I18n>({ lang: DEFAULT_LOCALE, t: (key) => key });

export function I18nProvider({ lang, dict, children }: { lang: Locale; dict: Dict; children: ReactNode }) {
  const value = useMemo(() => ({ lang, t: makeT(dict) }), [lang, dict]);
  return <I18nContext value={value}>{children}</I18nContext>;
}

export function useI18n(): I18n {
  return use(I18nContext);
}
