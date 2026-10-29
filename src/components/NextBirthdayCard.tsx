'use client';

import Link from 'next/link';
import { ArrowRight, Cake } from 'lucide-react';
import { useI18n } from '@/i18n/client';
import { formatBirthday } from '@/lib/dates';
import { useCountUp } from './useCountUp';

// Featured "next birthday" card: the brand-coloured hero of the home screen,
// with a countdown that ticks down to the real number on arrival.
export default function NextBirthdayCard({
  person,
  isMe,
  whenLabel,
  href,
  className = '',
}: {
  person: { displayName: string; birthday: string | null; days: number; age: number | null };
  isMe: boolean;
  whenLabel: string;
  href: string;
  className?: string;
}) {
  const { t, lang } = useI18n();
  const days = person.days;
  const today = days === 0;
  const shown = useCountUp(days, 1000, Math.min(days + 18, 365));

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

      <p className="eyebrow relative">{t('dash.nextBirthday')}</p>

      <div className="relative flex items-center gap-4 mt-3">
        <div
          aria-label={today ? whenLabel : `${days} ${days === 1 ? t('dash.dayUnit') : t('dash.daysUnit')}`}
          className="w-[72px] h-[72px] shrink-0 rounded-2xl bg-white text-brand-ink grid place-items-center text-center"
        >
          {today ? (
            <Cake className="w-8 h-8" strokeWidth={2} aria-hidden="true" />
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
          <p className="heading text-[26px] sm:text-[30px] break-words">{person.displayName}</p>
          <p className="text-[15px] mt-1">
            {isMe ? t('common.you') : formatBirthday(person.birthday, lang)}
            {person.age ? ` · ${t('dash.turning', { age: person.age })}` : ''}
            {today && ` · ${whenLabel}`}
          </p>
        </div>
      </div>

      <Link
        href={href}
        className="press relative mt-4 inline-flex items-center gap-2 min-h-11 px-5 rounded-full bg-white text-brand-ink text-[15px] font-semibold"
      >
        {isMe ? t('nav.wishlist') : t('dash.viewList')}
        <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.4} aria-hidden="true" />
      </Link>
    </section>
  );
}
