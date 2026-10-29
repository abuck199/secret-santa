import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { notFound } from 'next/navigation';
import { lang as langParam } from 'next/root-params';
import Toaster from '@/components/Toaster';
import { LOCALES, isLocale } from '@/i18n/config';
import { I18nProvider } from '@/i18n/client';
import { getT } from '@/i18n/server';
import { getDict } from '@/i18n/translate';
import { fontVariables } from '../fonts';
import '../globals.css';

export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  const title = `ThatWish - ${t('app.tagline')}`;
  const description = t('landing.hero.subtitle');
  return {
    metadataBase: new URL('https://thatwish.com'),
    title: { default: title, template: '%s · ThatWish' },
    description,
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
    openGraph: {
      type: 'website',
      siteName: 'ThatWish',
      title,
      description,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/og-image.png'] },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f7f2e8',
  // Light only: keeps browsers from darkening form controls and scrollbars.
  colorScheme: 'light',
};

export default async function RootLayout({ children }: LayoutProps<'/[lang]'>) {
  const lang = await langParam();
  if (!isLocale(lang)) notFound();
  return (
    <html lang={lang} className={fontVariables}>
      <body className="min-h-dvh">
        <I18nProvider lang={lang} dict={getDict(lang)}>
          {children}
          <Toaster />
        </I18nProvider>
        {/* Cookieless, privacy-friendly analytics (no consent banner needed). */}
        <Analytics />
      </body>
    </html>
  );
}
