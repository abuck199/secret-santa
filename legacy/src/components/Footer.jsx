import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import Brand from './Brand';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';

// Shared footer used on the landing page, inside the app, and on legal pages.
// Mobile: compact centered rows. Desktop: brand · links · toggles.
export default function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <div className="hidden sm:block">
          <Brand size="sm" />
        </div>
        <div className="flex items-center gap-2 sm:order-3">
          <ThemeToggle />
          <LanguageToggle />
        </div>
        <div className="sm:order-2 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-xs text-mute">
          <span>© {year} ThatWish</span>
          <span aria-hidden="true">·</span>
          <Link to="/privacy" className="hover:text-fg transition">
            {t('legal.privacy')}
          </Link>
          <span aria-hidden="true">·</span>
          <Link to="/terms" className="hover:text-fg transition">
            {t('legal.terms')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
