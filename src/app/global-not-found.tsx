import type { Metadata, Viewport } from 'next';
import NotFoundContent from '@/components/NotFoundContent';
import { fontVariables } from './fonts';
import './globals.css';

// 404 for any URL no route matches. It bypasses the [lang] root layout, so it
// brings its own styles and fonts (see Next's not-found docs).
export const metadata: Metadata = {
  title: 'ThatWish - 404',
  robots: { index: false },
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }] },
};

export const viewport: Viewport = { themeColor: '#f7f2e8', colorScheme: 'light' };

export default function GlobalNotFound() {
  return (
    <html lang="en" className={fontVariables}>
      <body className="min-h-dvh">
        <NotFoundContent />
      </body>
    </html>
  );
}
