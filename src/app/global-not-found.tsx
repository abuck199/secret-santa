import type { Metadata } from 'next';
import NotFoundContent from '@/components/NotFoundContent';
import { themeInitScript } from '@/components/theme';
import { fontVariables } from './fonts';
import './globals.css';

// 404 for any URL no route matches. It bypasses the [lang] root layout, so it
// brings its own styles, fonts and theme script (see Next's not-found docs).
export const metadata: Metadata = {
  title: 'ThatWish - 404',
  robots: { index: false },
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }] },
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh">
        <NotFoundContent />
      </body>
    </html>
  );
}
