import React from 'react';
import { useI18n } from '../i18n/I18nContext';

export default function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  return (
    <footer className="hidden md:block border-t border-ink-200 bg-white/60 mt-12">
      <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between text-sm text-ink-400">
        <span>
          <span className="font-bold text-ink-600">Wishly</span> · {t('app.tagline')}
        </span>
        <span>© {year}</span>
      </div>
    </footer>
  );
}
