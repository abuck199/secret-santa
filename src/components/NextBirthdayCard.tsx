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
}: {
  person: { displayName: string; birthday: string | null; days: number; age: number | null };
  isMe: boolean;
  whenLabel: string;
  href: string;
}) {
  const { t, lang } = useI18n();
  const days = person.days;
  const today = days === 0;
  const shown = useCountUp(days, 1000, Math.min(days + 18, 365));

  return (
    <section className="relative overflow-hidden rounded-3xl bg-brand text-white p-5 sm:p-7 mb-5 animate-rise [animation-delay:120ms]">
      {/* Confetti-like shapes, purely decorative. */}
      <span aria-hidden="true" className="absolute right-6 top-5 w-6 h-6 rounded-full bg-sun animate-float" />
      <span
        aria-hidden="true"
        className="absolute right-16 top-12 w-3 h-3 rounded-[3px] bg-white/80 rotate-12 animate-float [animation-delay:600ms]"
      />
      <span
        aria-hidden="true"
        className="absolute right-7 top-16 w-4 h-4 rounded-full border-[3px] border-brand-soft animate-float [animation-delay:300ms]"
      />

      <p className="eyebrow relative">{t('dash.nextBirthday')}</p>

      <div className="relative flex items-center gap-4 mt-3">
        <div
          aria-label={today ? whenLabel : `${days} ${days === 1 ? t('dash.dayUnit') : t('dash.daysUnit')}`}
          className="w-[84px] h-[84px] shrink-0 rounded-[20px] bg-white text-brand-ink grid place-items-center text-center"
        >
          {today ? (
            <Cake className="w-9 h-9" strokeWidth={2} aria-hidden="true" />
          ) : (
            <div aria-hidden="true">
              <p className="heading text-[38px] tabular-nums">{shown}</p>
              <p className="eyebrow mt-0.5">{days === 1 ? t('dash.dayUnit') : t('dash.daysUnit')}</p>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="heading text-[32px] sm:text-4xl break-words">{person.displayName}</p>
          <p className="text-base mt-1.5">
            {isMe ? t('common.you') : formatBirthday(person.birthday, lang)}
            {person.age ? ` · ${t('dash.turning', { age: person.age })}` : ''}
            {today && ` · ${whenLabel}`}
          </p>
        </div>
      </div>

      <Link
        href={href}
        className="press relative mt-5 inline-flex items-center gap-2 min-h-12 px-5 rounded-full bg-white text-brand-ink text-base font-semibold"
      >
        {isMe ? t('nav.wishlist') : t('dash.viewList')}
        <ArrowRight className="w-5 h-5" strokeWidth={2.4} aria-hidden="true" />
      </Link>
    </section>
  );
}
