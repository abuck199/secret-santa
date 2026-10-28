// Public, crawlable pages with their English/French alternates (replaces the
// hand-written public/sitemap.xml). The signed-in app is not listed.

import type { MetadataRoute } from 'next';
import { localizedPath } from '@/i18n/config';
import { SITE_URL } from '@/lib/seo';

const PAGES: { path: string; changeFrequency: 'weekly' | 'monthly' | 'yearly'; priority: number }[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/login', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map(({ path, changeFrequency, priority }) => ({
    url: SITE_URL + localizedPath(path, 'en'),
    changeFrequency,
    priority,
    alternates: {
      languages: {
        en: SITE_URL + localizedPath(path, 'en'),
        fr: SITE_URL + localizedPath(path, 'fr'),
        'x-default': SITE_URL + localizedPath(path, 'en'),
      },
    },
  }));
}
