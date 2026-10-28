import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getT } from '@/i18n/server';
import Brand from './Brand';
import Footer from './Footer';
import LanguageToggle from './LanguageToggle';
import ThemeToggle from './ThemeToggle';

export type LegalSection = { h: string; body: string[] };

export default async function LegalLayout({
  title,
  updated,
  sections,
}: {
  title: string;
  updated?: string;
  sections: LegalSection[];
}) {
  const t = await getT();
  const home = '/';

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="sticky top-0 z-40 bg-paper/80 backdrop-blur-xl border-b border-line">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href={home} aria-label={t('legal.home')}>
            <Brand size="sm" />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
        <Link href={home} className="inline-flex items-center gap-1.5 text-sm text-mute hover:text-fg mb-6">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> {t('legal.home')}
        </Link>

        <h1 className="font-serif text-3xl font-medium tracking-tight text-fg">{title}</h1>
        {updated && (
          <p className="text-xs text-mute mt-2">
            {t('legal.updated')}: {updated}
          </p>
        )}

        <div className="mt-8 space-y-8">
          {sections.map((s) => (
            <section key={s.h}>
              <h2 className="font-serif text-lg font-medium text-fg mb-2">{s.h}</h2>
              {s.body.map((p) => (
                <p key={p} className="text-sm text-mute leading-relaxed mb-2">
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
