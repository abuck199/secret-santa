// Translations in Server Components: the language comes from the `[lang]` root
// segment, so no prop drilling.

import 'server-only';
import { lang as langParam } from 'next/root-params';
import { DEFAULT_LOCALE, isLocale, type Locale } from './config';
import { getDict, makeT, type TFunction } from './translate';

export async function getLang(): Promise<Locale> {
  const lang = await langParam();
  return isLocale(lang) ? lang : DEFAULT_LOCALE;
}

export async function getT(): Promise<TFunction> {
  return makeT(getDict(await getLang()));
}
