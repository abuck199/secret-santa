'use client';

import Link from 'next/link';
import { ArrowUpRight, Cake } from 'lucide-react';
import { useI18n } from '@/i18n/client';
import { formatBirthday } from '@/lib/dates';

// Featured "next birthday" card with a brand-coloured progress ring that fills as the
// date approaches.
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

  // Ring fills over the final stretch toward the birthday.
  const progress = Math.max(0, Math.min(1, (365 - days) / 365));
  const r = 34;
  const circ = 2 * Math.PI * r;
  const offset = today ? 0 : circ * (1 - progress);

  return (
    <div
      className="card lift relative overflow-hidden p-6 sm:p-7 mb-10 animate-slide-up"
      style={{ animationFillMode: 'backwards' }}
    >
      <div className="flex items-center gap-5 sm:gap-6">
        {/* Ring */}
        <div className="relative shrink-0 w-[92px] h-[92px]">
          <svg width="92" height="92" viewBox="0 0 92 92" className="-rotate-90">
            <circle cx="46" cy="46" r={r} fill="none" stroke="rgb(var(--line))" strokeWidth="5" />
            <circle
              cx="46"
              cy="46"
              r={r}
              fill="none"
              stroke="rgb(var(--brand))"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)' }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            {today ? (
              <Cake className="w-8 h-8 text-brand-ink" strokeWidth={1.7} />
            ) : (
              <div>
                <p className="font-display text-2xl font-medium text-fg leading-none tabular-nums">{days}</p>
                <p className="text-[10px] uppercase tracking-[0.12em] text-mute mt-1">
                  {days === 1 ? t('dash.dayUnit') : t('dash.daysUnit')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ink mb-1.5">
            {t('dash.nextBirthday')}
          </p>
          <p className="font-display text-xl sm:text-2xl font-medium text-fg leading-tight truncate">
            {person.displayName}
            {isMe && <span className="text-mute font-sans font-normal text-base"> · {t('common.you')}</span>}
          </p>
          <p className="text-sm text-mute mt-1.5">
            {formatBirthday(person.birthday, lang)}
            {person.age ? ` · ${t('dash.turning', { age: person.age })}` : ''}
            {' · '}
            <span className={today ? 'text-brand-ink font-medium' : ''}>{whenLabel}</span>
          </p>
        </div>

        {/* CTA */}
        {!isMe && (
          <Link href={href} className="btn-secondary shrink-0 hidden sm:inline-flex">
            {t('dash.viewList')}
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
