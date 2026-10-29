import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Cake,
  Check,
  EyeOff,
  Gift,
  ListChecks,
  Sparkles,
  Users,
} from 'lucide-react';
import Brand from '@/components/Brand';
import Footer from '@/components/Footer';
import LanguageToggle from '@/components/LanguageToggle';
import { getLang, getT } from '@/i18n/server';
import type { TFunction } from '@/i18n/translate';
import { alternates } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return { alternates: alternates('/', await getLang()) };
}

export default async function LandingPage() {
  const t = await getT();
  const lang = await getLang();
  // Sign-up and sign-in are the same email-code flow now.
  const login = '/login';

  const features = [
    { icon: ListChecks, title: t('landing.feature1.title'), desc: t('landing.feature1.desc') },
    { icon: EyeOff, title: t('landing.feature2.title'), desc: t('landing.feature2.desc') },
    { icon: Cake, title: t('landing.feature3.title'), desc: t('landing.feature3.desc') },
    { icon: Sparkles, title: t('landing.feature4.title'), desc: t('landing.feature4.desc') },
  ];

  const steps = [
    { n: '01', title: t('landing.step1.title'), desc: t('landing.step1.desc') },
    { n: '02', title: t('landing.step2.title'), desc: t('landing.step2.desc') },
    { n: '03', title: t('landing.step3.title'), desc: t('landing.step3.desc') },
  ];

  return (
    <div className="min-h-screen bg-paper text-fg">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-fg focus:text-paper focus:shadow-card focus:text-sm focus:font-medium"
      >
        {t('a11y.skip')}
      </a>
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-paper/80 backdrop-blur-xl border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/">
            <Brand size="sm" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href={login} className="btn-ghost px-3 py-2 text-sm hidden min-[360px]:inline-flex">
              {t('landing.signin')}
            </Link>
            <Link href={login} className="btn-primary px-3.5 py-2 text-sm">
              {t('landing.getStarted')}
            </Link>
            {/* Last, so it stays anchored to the right edge: the button's
                width changes with the language and would push things around. */}
            <div className="hidden sm:flex items-center gap-2">
              <LanguageToggle />
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="outline-none">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-10 items-center">
            <div className="min-w-0 animate-slide-up">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ink mb-4">
                {t('landing.hero.eyebrow')}
              </p>
              <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight leading-[1.08]">
                {t('landing.hero.title')}
              </h1>
              <p className="text-mute text-base sm:text-lg mt-5 leading-relaxed max-w-xl">
                {t('landing.hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Link href={login} className="btn-primary w-full sm:w-auto px-5 py-3 text-base">
                  {t('landing.hero.cta')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link href={login} className="btn-secondary w-full sm:w-auto px-5 py-3 text-base">
                  {t('landing.hero.secondary')}
                </Link>
              </div>
              <p className="text-xs text-mute mt-4 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-brand-ink" aria-hidden="true" /> {t('landing.hero.free')}
              </p>
            </div>

            <div className="min-w-0 animate-scale-in" aria-hidden="true">
              <MockPreview t={t} locale={lang === 'fr' ? 'fr-CA' : 'en-US'} />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-line bg-panel/40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="max-w-2xl mb-12">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ink mb-3">
                {t('landing.features.eyebrow')}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-medium tracking-tight">
                {t('landing.features.title')}
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="card p-6">
                  <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand-ink grid place-items-center mb-4">
                    <Icon className="w-5 h-5" strokeWidth={1.8} aria-hidden="true" />
                  </div>
                  <h3 className="font-medium text-fg mb-1.5">{title}</h3>
                  <p className="text-sm text-mute leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ink mb-3">
              {t('landing.how.eyebrow')}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-medium tracking-tight">
              {t('landing.how.title')}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {steps.map((s) => (
              <div key={s.n} className="card p-6">
                <span className="font-display text-2xl font-medium text-brand-ink">{s.n}</span>
                <h3 className="font-medium text-fg mt-3 mb-1.5">{s.title}</h3>
                <p className="text-sm text-mute leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA band */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          <div className="card p-10 sm:p-14 text-center bg-brand-soft/40">
            <h2 className="font-display text-2xl sm:text-3xl font-medium tracking-tight">
              {t('landing.cta.title')}
            </h2>
            <p className="text-mute mt-3 max-w-md mx-auto">{t('landing.cta.subtitle')}</p>
            <Link href={login} className="btn-primary px-6 py-3 text-base mt-7">
              {t('landing.getStarted')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// A static, stylized preview of the app for the hero (decorative only).
function MockPreview({ t, locale }: { t: TFunction; locale: string }) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const sampleDate = new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric' }).format(
    new Date(2000, 5, 30),
  );
  const items = [
    { name: t('landing.mock.item1'), reserved: true },
    { name: t('landing.mock.item2'), reserved: false },
    { name: t('landing.mock.item3'), reserved: false },
  ];
  return (
    <div className="card p-5 sm:p-6 shadow-card max-w-md mx-auto">
      {/* Faux next-birthday widget */}
      <div className="rounded-2xl border border-line p-5 flex items-center gap-4 mb-4">
        <div className="relative shrink-0 w-[76px] h-[76px]">
          <svg width="76" height="76" viewBox="0 0 76 76" className="-rotate-90">
            <circle cx="38" cy="38" r={r} fill="none" stroke="rgb(var(--line))" strokeWidth="5" />
            <circle
              cx="38"
              cy="38"
              r={r}
              fill="none"
              stroke="rgb(var(--brand))"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * 0.18}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="font-display text-xl font-medium leading-none tabular-nums">3</p>
              <p className="text-[9px] uppercase tracking-wide text-mute mt-0.5">{t('dash.daysUnit')}</p>
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-ink">
            {t('landing.mock.next')}
          </p>
          <p className="font-display text-lg font-medium leading-tight">Camille</p>
          <p className="text-xs text-mute mt-0.5">{sampleDate} · {t('dash.turning', { age: 32 })}</p>
        </div>
      </div>

      {/* Faux wishlist rows */}
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.name} className="flex items-center gap-3 p-3 rounded-xl bg-panel-2 border border-line">
            <Gift className="w-4 h-4 text-mute shrink-0" />
            <span className="text-sm font-medium text-fg flex-1 truncate">{item.name}</span>
            {item.reserved ? (
              <span className="chip bg-brand-soft text-brand-ink border border-brand/30">
                <Check className="w-3 h-3" /> {t('landing.mock.reserved')}
              </span>
            ) : (
              <span className="chip bg-fg text-paper">{t('landing.mock.reserve')}</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-4 text-xs text-mute">
        <Users className="w-3.5 h-3.5" /> {t('landing.mock.summary')}
      </div>
    </div>
  );
}
