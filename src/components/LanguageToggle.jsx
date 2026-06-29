import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import { parsePublicPath, localizedPath } from '../lib/seo';

// Compact EN / FR segmented toggle. On public pages it also swaps the URL
// between the English and French (/fr) variants so the route reflects the
// language; inside the app it just changes the language preference.
export default function LanguageToggle({ className = '' }) {
  const { lang, setLang, t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const change = (code) => {
    setLang(code);
    const info = parsePublicPath(location.pathname);
    if (info.isPublic) navigate(localizedPath(info.base, code));
  };

  const langs = [
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
  ];

  return (
    <div role="group" aria-label={t('a11y.language')} className={`inline-flex items-center rounded-full border border-line p-0.5 ${className}`}>
      {langs.map((l) => (
        <button
          key={l.code}
          onClick={() => change(l.code)}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold transition ${
            lang === l.code ? 'bg-fg text-paper' : 'text-mute hover:text-fg'
          }`}
          aria-pressed={lang === l.code}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
