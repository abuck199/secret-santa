import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Cake, Check, EyeOff, ListChecks, Lock, Sparkles, Users } from 'lucide-react';
import Brand from '@/components/Brand';
import { WrappedGift } from '@/components/Celebration';
import Footer from '@/components/Footer';
import LanguageToggle from '@/components/LanguageToggle';
import { getLang, getT } from '@/i18n/server';
import type { TFunction } from '@/i18n/translate';
import { appJsonLd, publicMetadata } from '@/lib/seo';
import MockName from './mock-name';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return publicMetadata(t, await getLang(), '/', { description: t('landing.hero.subtitle') });
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
      {/* Tells search engines what ThatWish is (a free web app). */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: appJsonLd(lang, t('landing.hero.subtitle')) }} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-fg focus:text-paper focus:shadow-card focus:text-sm focus:font-medium"
      >
        {t('a11y.skip')}
      </a>
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="shrink-0">
            <Brand size="sm" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Phones have "I already have an account" right under the hero. */}
            <Link href={login} className="btn-ghost px-3 hidden min-[420px]:inline-flex">
              {t('landing.signin')}
            </Link>
            <Link href={login} className="btn-primary px-4">
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
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-16 pb-14">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="min-w-0">
              <p className="eyebrow text-brand-ink mb-3 animate-rise">{t('landing.hero.eyebrow')}</p>
              <h1 className="heading text-[32px] sm:text-[52px] leading-[0.98] animate-rise [animation-delay:80ms]">
                {t('landing.hero.title')}
              </h1>
              <p className="text-mute text-base sm:text-lg mt-5 leading-relaxed max-w-xl animate-rise [animation-delay:160ms]">
                {t('landing.hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-7 animate-rise [animation-delay:240ms]">
                <Link href={login} className="btn-primary w-full sm:w-auto px-6">
                  {t('landing.hero.cta')} <ArrowRight className="w-[18px] h-[18px]" aria-hidden="true" />
                </Link>
                <Link href={login} className="btn-secondary w-full sm:w-auto px-6">
                  {t('landing.hero.secondary')}
                </Link>
              </div>
              <p className="text-sm text-mute mt-4 flex items-center gap-1.5 animate-rise [animation-delay:300ms]">
                <Check className="w-4 h-4 text-brand-ink" strokeWidth={3} aria-hidden="true" /> {t('landing.hero.free')}
              </p>
            </div>

            <div className="min-w-0 animate-rise [animation-delay:200ms]" aria-hidden="true">
              <MockPreview t={t} locale={lang === 'fr' ? 'fr-CA' : 'en-US'} />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-panel/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <div className="max-w-2xl mb-8">
              <p className="eyebrow text-brand-ink mb-2">{t('landing.features.eyebrow')}</p>
              <h2 className="heading text-[28px] sm:text-4xl">{t('landing.features.title')}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="card p-5">
                  <span className="w-12 h-12 rounded-2xl bg-brand-soft text-brand-ink grid place-items-center mb-4">
                    <Icon className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
                  </span>
                  <h3 className="text-base font-bold text-fg mb-1.5">{title}</h3>
                  <p className="text-[15px] text-mute leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="max-w-2xl mb-8">
            <p className="eyebrow text-brand-ink mb-2">{t('landing.how.eyebrow')}</p>
            <h2 className="heading text-[28px] sm:text-4xl">{t('landing.how.title')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {steps.map((s) => (
              <div key={s.n} className="card p-5">
                <span className="heading text-4xl text-brand">{s.n}</span>
                <h3 className="text-base font-bold text-fg mt-3 mb-1.5">{s.title}</h3>
                <p className="text-[15px] text-mute leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA band */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          <div className="relative overflow-hidden rounded-[32px] bg-brand text-white px-6 py-12 sm:p-16 text-center">
            <span aria-hidden="true" className="absolute left-8 top-8 w-8 h-8 rounded-full bg-sun animate-float" />
            <span aria-hidden="true" className="absolute right-10 top-12 w-4 h-4 rounded-[4px] bg-white/80 rotate-12 animate-float [animation-delay:700ms]" />
            <span aria-hidden="true" className="absolute right-16 bottom-10 w-6 h-6 rounded-full border-4 border-brand-soft animate-float [animation-delay:300ms]" />
            <h2 className="heading text-[28px] sm:text-4xl relative">{t('landing.cta.title')}</h2>
            <p className="mt-3 max-w-md mx-auto text-base relative">{t('landing.cta.subtitle')}</p>
            <Link
              href={login}
              className="press relative inline-flex items-center gap-2 min-h-12 px-6 mt-7 rounded-full bg-white text-brand-ink text-base font-semibold"
            >
              {t('landing.getStarted')} <ArrowRight className="w-[18px] h-[18px]" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// A static preview of the app for the hero (decorative only): the same
// raspberry next-birthday card and gift cards as the real home and list.
function MockPreview({ t, locale }: { t: TFunction; locale: string }) {
  const sampleDate = new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric' }).format(
    new Date(2000, 5, 30),
  );
  const items = [
    { name: t('landing.mock.item1'), reserved: true },
    { name: t('landing.mock.item2'), reserved: false },
    { name: t('landing.mock.item3'), reserved: false },
  ];
  return (
    <div className="max-w-md mx-auto space-y-3">
      <div className="relative overflow-hidden rounded-3xl bg-brand text-white p-5">
        <span className="absolute right-5 top-4 w-5 h-5 rounded-full bg-sun animate-float" />
        <span className="absolute right-14 top-10 w-2.5 h-2.5 rounded-[3px] bg-white/80 rotate-12 animate-float [animation-delay:600ms]" />
        <p className="eyebrow">{t('landing.mock.next')}</p>
        <div className="flex items-center gap-4 mt-3">
          <div className="w-[68px] h-[68px] shrink-0 rounded-2xl bg-white text-brand-ink grid place-items-center text-center">
            <div>
              <p className="heading text-[28px] tabular-nums">3</p>
              <p className="font-mono text-[11px] font-semibold uppercase mt-0.5">{t('dash.daysUnit')}</p>
            </div>
          </div>
          <div className="min-w-0">
            <p className="heading text-[26px]">
              <MockName />
            </p>
            <p className="text-[15px] mt-1">{sampleDate} · {t('dash.turning', { age: 32 })}</p>
          </div>
        </div>
      </div>

      {items.map((item) => (
        <div key={item.name} className="flex items-center gap-3 p-3 rounded-[20px] bg-panel shadow-soft">
          <span className="w-12 h-12 shrink-0 rounded-2xl bg-brand-soft text-brand-ink grid place-items-center">
            <WrappedGift className="w-8 h-8" />
          </span>
          <span className="text-[15px] font-bold text-fg flex-1 truncate">{item.name}</span>
          {item.reserved ? (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-sun text-sm font-semibold">
              <Check className="w-4 h-4" strokeWidth={3} /> {t('landing.mock.reserved')}
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-full bg-fg text-white text-sm font-semibold">{t('landing.mock.reserve')}</span>
          )}
        </div>
      ))}

      <p className="flex items-center gap-2 px-1 text-sm text-mute">
        <Users className="w-4 h-4" /> {t('landing.mock.summary')}
        <Lock className="w-4 h-4 ml-auto" />
      </p>
    </div>
  );
}
