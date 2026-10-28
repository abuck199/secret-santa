// Per-page SEO for public pages: canonical URL + hreflang alternates, so each
// page's English and French versions point at each other (replaces the old
// usePublicSeo hook that patched <head> at runtime).

import type { Metadata } from 'next';
import { localizedPath, type Locale } from '@/i18n/config';

export const SITE_URL = 'https://thatwish.com';

export function alternates(path: string, lang: Locale): Metadata['alternates'] {
  return {
    canonical: localizedPath(path, lang),
    languages: {
      en: localizedPath(path, 'en'),
      fr: localizedPath(path, 'fr'),
      'x-default': localizedPath(path, 'en'),
    },
  };
}
