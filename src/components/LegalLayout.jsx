import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import Brand from './Brand';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import Footer from './Footer';

export default function LegalLayout({ title, updated, sections }) {
  const { t } = useI18n();

  useEffect(() => {
    document.title = `${title} · Souhaity`;
    window.scrollTo({ top: 0 });
  }, [title]);

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="sticky top-0 z-40 bg-paper/80 backdrop-blur-xl border-b border-line">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/">
            <Brand size="sm" />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-mute hover:text-fg mb-6">
          <ArrowLeft className="w-4 h-4" /> {t('legal.home')}
        </Link>

        <h1 className="font-serif text-3xl font-medium tracking-tight text-fg">{title}</h1>
        {updated && (
          <p className="text-xs text-mute mt-2">
            {t('legal.updated')}: {updated}
          </p>
        )}
        <p className="text-sm text-mute italic mt-4 p-3 rounded-xl bg-panel-2 border border-line">
          {t('legal.template')}
        </p>

        <div className="mt-8 space-y-8">
          {sections.map((s, i) => (
            <section key={i}>
              <h2 className="font-serif text-lg font-medium text-fg mb-2">{s.h}</h2>
              {s.body.map((p, j) => (
                <p key={j} className="text-sm text-mute leading-relaxed mb-2">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
