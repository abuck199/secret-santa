import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getT } from '@/i18n/server';
import Brand from './Brand';
import Footer from './Footer';
import LanguageToggle from './LanguageToggle';

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
      <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href={home} aria-label={t('legal.home')}>
            <Brand size="sm" />
          </Link>
          <LanguageToggle />
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Link
          href={home}
          className="press inline-flex items-center gap-1.5 min-h-11 pl-3 pr-4 mb-5 rounded-full bg-panel shadow-soft text-[15px] font-semibold text-fg"
        >
          <ArrowLeft className="w-[18px] h-[18px]" strokeWidth={2.4} aria-hidden="true" /> {t('legal.home')}
        </Link>

        <h1 className="heading text-[30px] sm:text-4xl text-fg animate-rise">{title}</h1>
        {updated && (
          <p className="eyebrow text-mute mt-3">
            {t('legal.updated')}: {updated}
          </p>
        )}

        <div className="card p-5 sm:p-8 mt-6 space-y-7 animate-rise [animation-delay:100ms]">
          {sections.map((s) => (
            <section key={s.h}>
              <h2 className="heading text-lg text-fg mb-2">{s.h}</h2>
              {s.body.map((p) => (
                <p key={p} className="text-[15px] text-mute leading-relaxed mb-2">
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
