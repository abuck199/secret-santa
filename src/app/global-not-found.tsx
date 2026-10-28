import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import NotFoundContent from '@/components/NotFoundContent';
import { themeInitScript } from '@/components/theme';
import './globals.css';

// 404 for any URL no route matches. It bypasses the [lang] root layout, so it
// brings its own styles, fonts and theme script (see Next's not-found docs).
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', axes: ['opsz'], display: 'swap' });

export const metadata: Metadata = {
  title: 'ThatWish - 404',
  robots: { index: false },
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }] },
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh">
        <NotFoundContent />
      </body>
    </html>
  );
}
