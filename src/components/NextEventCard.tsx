'use client';

import Link from 'next/link';
import { ArrowRight, Cake, TreePine } from 'lucide-react';
import { useI18n } from '@/i18n/client';
import { useCountUp } from './useCountUp';

// Featured "next event" card (a birthday or Christmas): the brand-coloured hero
// of the home screen, with a countdown that ticks down to the real number on arrival.
export default function NextEventCard({
  kind,
  eyebrow,
  title,
  detail,
  days,
  whenLabel,
  href,
  linkLabel,
  className = '',
}: {
  kind: 'birthday' | 'christmas';
  eyebrow: string;
  title: string;
  detail: string;
  days: number;
  whenLabel: string;
  href: string;
  linkLabel: string;
  className?: string;
}) {
  const { t } = useI18n();
  const today = days === 0;
  const shown = useCountUp(days, 1000, Math.min(days + 18, 365));
  const TodayIcon = kind === 'christmas' ? TreePine : Cake;

  return (
    <section className={`relative overflow-hidden rounded-3xl bg-brand text-white p-5 sm:p-6 ${className}`}>
      {/* Confetti-like shapes, purely decorative. */}
      <span aria-hidden="true" className="absolute right-5 top-4 w-5 h-5 rounded-full bg-sun animate-float" />
      <span
        aria-hidden="true"
        className="absolute right-14 top-10 w-2.5 h-2.5 rounded-[3px] bg-white/80 rotate-12 animate-float [animation-delay:600ms]"
      />
      <span
        aria-hidden="true"
        className="absolute right-6 top-14 w-3.5 h-3.5 rounded-full border-[3px] border-brand-soft animate-float [animation-delay:300ms]"
      />

      <p className="eyebrow relative">{eyebrow}</p>

      <div className="relative flex items-center gap-4 mt-3">
        <div
          aria-label={today ? whenLabel : `${days} ${days === 1 ? t('dash.dayUnit') : t('dash.daysUnit')}`}
          className="w-[72px] h-[72px] shrink-0 rounded-2xl bg-white text-brand-ink grid place-items-center text-center"
        >
          {today ? (
            <TodayIcon className="w-8 h-8" strokeWidth={2} aria-hidden="true" />
          ) : (
            <div aria-hidden="true">
              <p className="heading text-[30px] tabular-nums">{shown}</p>
              <p className="font-mono text-[11px] font-semibold uppercase mt-0.5">
                {days === 1 ? t('dash.dayUnit') : t('dash.daysUnit')}
              </p>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="heading text-[26px] sm:text-[30px] break-words">{title}</p>
          <p className="text-[15px] mt-1">
            {detail}
            {today && ` · ${whenLabel}`}
          </p>
        </div>
      </div>

      <Link
        href={href}
        className="press relative mt-4 inline-flex items-center gap-2 min-h-11 px-5 rounded-full bg-white text-brand-ink text-[15px] font-semibold"
      >
        {linkLabel}
        <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.4} aria-hidden="true" />
      </Link>
    </section>
  );
}
