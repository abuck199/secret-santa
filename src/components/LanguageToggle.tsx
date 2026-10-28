'use client';

import { usePathname, useRouter } from 'next/navigation';
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
// the OTP email read it) and re-renders the same URL in that language. On a
// crawlable /fr page it moves to the plain URL.
export default function LanguageToggle({ className = '' }: { className?: string }) {
  const { lang, t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();

  function change(code: Locale) {
    if (code === lang) return;
    rememberLang(code);
    const plain = stripLocale(pathname);
    if (plain !== pathname) router.push(plain + window.location.search);
    else router.refresh();
  }

  return (
    <div role="group" aria-label={t('a11y.language')} className={`inline-flex items-center rounded-full border border-line p-0.5 ${className}`}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
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
