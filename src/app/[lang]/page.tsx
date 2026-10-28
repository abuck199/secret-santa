// TEMPORARY (step 5a): a style check page for the ported foundations. The real
// landing page replaces it in step 5b.

import Brand from '@/components/Brand';
import LanguageToggle from '@/components/LanguageToggle';
import ThemeToggle from '@/components/ThemeToggle';
import { getT } from '@/i18n/server';
import ToastDemo from './toast-demo';

export default async function Home() {
  const t = await getT();
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-6 animate-fade-in">
      <header className="flex items-center justify-between">
        <Brand />
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <section className="card p-6 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-gold">{t('landing.hero.eyebrow')}</p>
        <h1 className="font-serif text-4xl tracking-tightest">{t('landing.hero.title')}</h1>
        <p className="text-mute">{t('landing.hero.subtitle')}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          <button className="btn-primary">{t('landing.hero.cta')}</button>
          <button className="btn-secondary">{t('landing.hero.secondary')}</button>
          <button className="btn-ghost">Ghost</button>
          <button className="btn-danger">Danger</button>
          <button className="btn-primary" disabled>Disabled</button>
        </div>
      </section>

      <section className="card p-6 space-y-4">
        <div>
          <label className="label" htmlFor="demo-email">{t('auth.email')}</label>
          <input id="demo-email" className="input" placeholder={t('auth.emailPlaceholder')} />
        </div>
        <div>
          <label className="label" htmlFor="demo-bad">Error state</label>
          <input id="demo-bad" className="input input-error" defaultValue="oops" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip bg-goldsoft text-gold">chip</span>
          <a className="link" href="#">{t('app.name')} link</a>
          <span className="skeleton h-4 w-32 rounded" />
          <ToastDemo />
        </div>
      </section>
    </main>
  );
}
