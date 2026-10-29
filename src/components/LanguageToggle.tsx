'use client';

import { usePathname } from 'next/navigation';
import { LANG_COOKIE, stripLocale, type Locale } from '@/i18n/config';
import { useI18n } from '@/i18n/client';

const LANGS: { code: Locale; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
];

function rememberLang(code: Locale) {
  document.cookie = `${LANG_COOKIE}=${code}; path=/; max-age=31536000; samesite=lax`;
}

// Compact EN / FR segmented toggle. Saves the choice in a cookie (the proxy and
// the OTP email read it) and reloads the same URL in that language (on a
// crawlable /fr page, the plain URL). A full page load, not router.refresh():
// the language is the root layout's param, and client-rendering a new root
// layout would re-create <html>.
export default function LanguageToggle({ className = '' }: { className?: string }) {
  const { lang, t } = useI18n();
  const pathname = usePathname();

  function change(code: Locale) {
    if (code === lang) return;
    rememberLang(code);
    window.location.assign(stripLocale(pathname) + window.location.search);
  }

  return (
    <div role="group" aria-label={t('a11y.language')} className={`inline-flex items-center rounded-full bg-panel border-2 border-line p-0.5 ${className}`}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => change(l.code)}
          className={`min-h-10 min-w-11 px-3 rounded-full text-sm font-semibold transition ${
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
