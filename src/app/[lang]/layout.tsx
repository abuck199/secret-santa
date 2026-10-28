import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { lang as langParam } from 'next/root-params';
import Toaster from '@/components/Toaster';
import { themeInitScript } from '@/components/theme';
import { LOCALES, isLocale } from '@/i18n/config';
import { I18nProvider } from '@/i18n/client';
import { getT } from '@/i18n/server';
import { getDict } from '@/i18n/translate';
import '../globals.css';

// next/font downloads the files at build time and serves them from our own
// domain: no visitor request ever reaches Google (same promise as the old
// app's @fontsource setup).
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  axes: ['opsz'],
  display: 'swap',
});

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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f4ef' },
    { media: '(prefers-color-scheme: dark)', color: '#171614' },
  ],
};

export default async function RootLayout({ children }: LayoutProps<'/[lang]'>) {
  const lang = await langParam();
  if (!isLocale(lang)) notFound();
  return (
    // The theme script changes <html>'s class before React hydrates.
    <html lang={lang} className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh">
        <I18nProvider lang={lang} dict={getDict(lang)}>
          {children}
          <Toaster />
        </I18nProvider>
      </body>
    </html>
  );
}
