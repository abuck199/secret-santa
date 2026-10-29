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
    <Page>
      <div className="mb-6 animate-rise">
        {/* The server's "today" can differ from the browser's around midnight. */}
        <p className="eyebrow text-mute mb-2" suppressHydrationWarning>{todayLabel}</p>
        <h1 className="heading text-[40px] sm:text-5xl text-fg">{t('dash.greeting', { name: myName })}</h1>
      </div>

      {hero ? (
        <NextBirthdayCard person={hero} isMe={hero.isMe} whenLabel={whenLabel(hero.days)} href={listHref(hero)} />
      ) : (
        <div className="card p-6 mb-5 animate-rise">
          <p className="text-base text-mute">{t('dash.noBirthdays')}</p>
        </div>
      )}

      {santaReady && (
        <Link
          href="/app/match"
          className="press flex items-center gap-4 min-h-[72px] mb-5 p-4 rounded-3xl bg-sun-soft text-fg animate-rise [animation-delay:200ms]"
        >
          <span className="w-12 h-12 shrink-0 rounded-full bg-sun grid place-items-center" aria-hidden="true">
            <Gift className="w-6 h-6" strokeWidth={2.2} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="eyebrow block">Secret Santa</span>
            <span className="block text-lg font-bold leading-snug">{t('dash.santaReady')}</span>
          </span>
          <ChevronRight className="w-6 h-6 shrink-0" strokeWidth={2.4} aria-hidden="true" />
        </Link>
      )}

      <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-8">
        {stats.map(({ value, label, to, mine }, i) => (
          <Link
            key={to}
            href={to}
            className={`press flex flex-col gap-1 p-4 rounded-[20px] animate-rise ${mine ? 'bg-sun' : 'bg-panel shadow-soft'}`}
            style={{ animationDelay: `${260 + i * 70}ms` }}
          >
            <StatNumber value={value} className={mine ? 'text-fg' : 'text-brand-ink'} />
            <span className="text-[15px] font-semibold leading-tight text-fg">{label}</span>
          </Link>
        ))}
      </div>

      {rest.length > 0 && (
        <section>
          <h2 className="heading text-[22px] text-fg mb-3 animate-rise [animation-delay:400ms]">
            {t('dash.upcomingBirthdays')}
          </h2>
          <ul className="space-y-2.5">
            {rest.map((m, i) => (
              <li key={m.userId} className="animate-rise" style={{ animationDelay: `${450 + i * 60}ms` }}>
                <Link
                  href={listHref(m)}
                  className="press flex items-center gap-3 min-h-16 px-3 py-2.5 rounded-[20px] bg-panel shadow-soft"
                >
                  <span
                    aria-hidden="true"
                    className="w-11 h-11 shrink-0 rounded-full bg-brand text-white grid place-items-center font-display font-black text-lg"
                  >
                    {(m.displayName[0] || '?').toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[17px] font-bold text-fg truncate">
                      {m.displayName}
                      {m.isMe && <span className="text-mute font-normal"> · {t('common.you')}</span>}
                    </span>
                    <span className="block text-[15px] text-mute">
                      {formatBirthday(m.birthday, lang)}
                      {m.age ? ` · ${t('dash.turning', { age: m.age })}` : ''}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-full font-mono text-[13px] font-semibold ${
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
    </Page>
  );
}

function StatNumber({ value, className }: { value: number; className: string }) {
  const animated = useCountUp(value);
  return (
    <span className={`heading text-[30px] tabular-nums ${className}`} aria-label={String(value)}>
      {animated}
    </span>
  );
}
