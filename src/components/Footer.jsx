import React from 'react';
import { useI18n } from '../i18n/I18nContext';

export default function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  return (
    <footer className="hidden md:block border-t border-line mt-16">
      <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between text-sm text-mute">
        <span>
          <span className="font-serif font-semibold text-fg">Wishly</span> · {t('app.tagline')}
        </span>
        <span className="tabular-nums">© {year}</span>
      </div>
    </footer>
  );
}
