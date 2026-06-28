import React from 'react';
import { useI18n } from '../i18n/I18nContext';

// Compact EN / FR segmented toggle.
export default function LanguageToggle({ className = '' }) {
  const { lang, setLang } = useI18n();
  const langs = [
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
  ];
  return (
    <div
      className={`inline-flex items-center rounded-full bg-ink-100 p-0.5 ${className}`}
    >
      {langs.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`px-2.5 py-1 rounded-full text-xs font-bold transition ${
            lang === l.code
              ? 'bg-white text-brand-700 shadow-sm'
              : 'text-ink-500 hover:text-ink-700'
          }`}
          aria-pressed={lang === l.code}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
