// Per-page SEO for public pages: canonical URL + hreflang alternates, so each
// page's English and French versions point at each other, plus Open Graph /
// Twitter tags with the page's own URL and description.

import type { Metadata } from 'next';
import { localizedPath, type Locale } from '@/i18n/config';
import type { TFunction } from '@/i18n/translate';

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

const OG_LOCALE: Record<Locale, string> = { en: 'en_CA', fr: 'fr_CA' };

// Everything a public page needs. Page-level openGraph replaces the layout's
// (Next doesn't deep-merge it), so the image and site name are repeated here.
export function publicMetadata(
  t: TFunction,
  lang: Locale,
  path: string,
  { title, description }: { title?: string; description: string },
): Metadata {
  const fullTitle = title ? `${title} · ThatWish` : `ThatWish - ${t('app.tagline')}`;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: alternates(path, lang),
    openGraph: {
      type: 'website',
      siteName: 'ThatWish',
      url: localizedPath(path, lang),
      locale: OG_LOCALE[lang],
      alternateLocale: OG_LOCALE[lang === 'fr' ? 'en' : 'fr'],
      title: fullTitle,
      description,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: ['/og-image.png'] },
  };
}

// schema.org description of the app for search engines (landing page only).
export function appJsonLd(lang: Locale, description: string): string {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ThatWish',
    url: SITE_URL + localizedPath('/', lang),
    description,
    inLanguage: lang === 'fr' ? 'fr-CA' : 'en-CA',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Any',
    image: `${SITE_URL}/og-image.png`,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'CAD' },
  };
  // `<` escaped so the JSON can never close its <script> tag.
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
