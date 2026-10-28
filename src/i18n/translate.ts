// The t() used on both sides: same keys and {placeholder} syntax as the old app.

import type { Locale } from './config';
import { translations } from './translations';

export type Dict = Record<string, string>;
export type TFunction = (key: string, vars?: Record<string, string | number>) => string;

// The dictionary for `lang`, with English filling any key French is missing.
export function getDict(lang: Locale): Dict {
  return lang === 'en' ? translations.en : { ...translations.en, ...translations[lang] };
}

export function makeT(dict: Dict): TFunction {
  return (key, vars) => {
    const str = dict[key] ?? key;
    if (!vars) return str;
    return str.replace(/\{(\w+)\}/g, (m, name) => (vars[name] != null ? String(vars[name]) : m));
  };
}
