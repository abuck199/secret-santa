'use client';

import Link from 'next/link';
import { ChevronRight, Gift } from 'lucide-react';
import NextBirthdayCard from '@/components/NextBirthdayCard';
import { Page } from '@/components/PageHeader';
import { useCountUp } from '@/components/useCountUp';
import { useI18n } from '@/i18n/client';
import { ageTurningNext, daysUntilBirthday, formatBirthday } from '@/lib/dates';

type Person = { userId: string; displayName: string; birthday: string | null; isMe: boolean };

// Where "see their list" goes for a member.
const listHref = (p: Person) => (p.isMe ? '/app/list' : `/app/members#m-${p.userId}`);

export default function Dashboard({
  myName,
  members,
  myCount,
  reservationCount,
  santaReady,
}: {
  myName: string;
  members: Person[];
  myCount: number;
  reservationCount: number;
  santaReady: boolean;
}) {
  const { t, lang } = useI18n();

  // "Days until" depends on the viewer's today.
  const birthdays = members
    .filter((m) => m.birthday)
    .map((m) => ({ ...m, days: daysUntilBirthday(m.birthday) ?? 0, age: ageTurningNext(m.birthday) }))
    .sort((a, b) => a.days - b.days);

  function whenLabel(days: number) {
    if (days === 0) return t('dash.birthdayToday');
    if (days === 1) return t('dash.birthdayTomorrow');
    return t('dash.birthdayInDays', { days });
  }

  const hero = birthdays[0];
  const rest = birthdays.slice(1, 6);
  const todayLabel = new Intl.DateTimeFormat(lang === 'fr' ? 'fr-CA' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const stats = [
    { value: myCount, label: t('dash.statWishes'), to: '/app/list', mine: false },
    // Yellow = "this is yours": the gifts you said you'd give.
    { value: reservationCount, label: t('dash.statToGive'), to: '/app/reservations', mine: true },
    { value: members.length, label: t('dash.statMembers'), to: '/app/members', mine: false },
  ];

  return (
    <Page wide>
      <div className="mb-5 sm:mb-7 animate-rise">
        {/* The server's "today" can differ from the browser's around midnight. */}
        <p className="eyebrow text-mute mb-1.5" suppressHydrationWarning>{todayLabel}</p>
        <h1 className="heading text-[28px] sm:text-[34px] text-fg">{t('dash.greeting', { name: myName })}</h1>
      </div>

      {/* One column on phones; on desktop the hero sits left, the rest right. */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-6 lg:items-start">
        <div className="space-y-3">
          {hero ? (
            <NextBirthdayCard
              person={hero}
              isMe={hero.isMe}
              whenLabel={whenLabel(hero.days)}
              href={listHref(hero)}
              className="animate-rise [animation-delay:100ms]"
            />
          ) : (
            <div className="card p-5 animate-rise">
              <p className="text-[15px] text-mute">{t('dash.noBirthdays')}</p>
            </div>
          )}

          {santaReady && (
            <Link
              href="/app/match"
              className="press flex items-center gap-3 min-h-16 p-3 rounded-[20px] bg-sun-soft text-fg animate-rise [animation-delay:180ms]"
            >
              <span className="w-10 h-10 shrink-0 rounded-full bg-sun grid place-items-center" aria-hidden="true">
                <Gift className="w-5 h-5" strokeWidth={2.2} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] block">Secret Santa</span>
                <span className="block text-base font-bold leading-snug">{t('dash.santaReady')}</span>
              </span>
              <ChevronRight className="w-5 h-5 shrink-0" strokeWidth={2.4} aria-hidden="true" />
            </Link>
          )}
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-2.5">
            {stats.map(({ value, label, to, mine }, i) => (
              <Link
                key={to}
                href={to}
                className={`press flex flex-col gap-1 px-3.5 py-3 rounded-[18px] animate-rise ${
                  mine ? 'bg-sun' : 'bg-panel shadow-soft'
                }`}
                style={{ animationDelay: `${220 + i * 60}ms` }}
              >
                <StatNumber value={value} className={mine ? 'text-fg' : 'text-brand-ink'} />
                <span className="text-sm font-semibold leading-tight text-fg">{label}</span>
              </Link>
            ))}
          </div>

          {rest.length > 0 && (
            <section>
              <h2 className="heading text-lg text-fg mb-2.5 animate-rise [animation-delay:380ms]">
                {t('dash.upcomingBirthdays')}
              </h2>
              <ul className="space-y-2">
                {rest.map((m, i) => (
                  <li key={m.userId} className="animate-rise" style={{ animationDelay: `${420 + i * 50}ms` }}>
                    <Link
                      href={listHref(m)}
                      className="press flex items-center gap-3 min-h-14 px-3 py-2 rounded-[18px] bg-panel shadow-soft"
                    >
                      <span
                        aria-hidden="true"
                        className="w-10 h-10 shrink-0 rounded-full bg-brand text-white grid place-items-center font-display font-black"
                      >
                        {(m.displayName[0] || '?').toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-base font-bold text-fg truncate">
                          {m.displayName}
                          {m.isMe && <span className="text-mute font-normal"> · {t('common.you')}</span>}
                        </span>
                        <span className="block text-sm text-mute">
                          {formatBirthday(m.birthday, lang)}
                          {m.age ? ` · ${t('dash.turning', { age: m.age })}` : ''}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded-full font-mono text-xs font-semibold ${
                          m.days === 0 ? 'bg-brand text-white' : 'bg-brand-soft text-fg'
                        }`}
                      >
                        {whenLabel(m.days)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </Page>
  );
}

function StatNumber({ value, className }: { value: number; className: string }) {
  const animated = useCountUp(value);
  return (
    <span className={`heading text-2xl tabular-nums ${className}`} aria-label={String(value)}>
      {animated}
    </span>
  );
}
