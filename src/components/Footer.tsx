'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/client';
import Brand from './Brand';
import LanguageToggle from './LanguageToggle';

// The year is read in the browser only: pages are prerendered at build time,
// and Cache Components rejects `new Date()` during prerender.
const noSubscribe = () => () => {};
const currentYear = () => new Date().getFullYear();
const noYearOnServer = () => null;

// Shared footer used on the landing page, inside the app, and on legal pages.
// Mobile: compact centered rows. Desktop: brand · links · toggles.
export default function Footer() {
  const { t } = useI18n();
  const year = useSyncExternalStore(noSubscribe, currentYear, noYearOnServer);
  return (
    <footer className="border-t border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <div className="hidden sm:block">
          <Brand size="sm" />
        </div>
        <div className="sm:order-3">
          <LanguageToggle />
        </div>
        <div className="sm:order-2 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-xs text-mute">
          <span>© {year} ThatWish</span>
          <span aria-hidden="true">·</span>
          <Link href="/privacy" className="hover:text-fg transition">
            {t('legal.privacy')}
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/terms" className="hover:text-fg transition">
            {t('legal.terms')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
