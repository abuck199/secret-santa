import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import Brand from './Brand';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';

// Shared footer used on both the landing page and inside the app.
// Mobile: two compact centered rows (toggles + copyright).
// Desktop: a single row (brand · copyright · toggles).
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
        <p className="text-xs text-mute sm:order-2">
          © {year} Wishly · {t('landing.footer.rights')}
        </p>
      </div>
    </footer>
  );
}
