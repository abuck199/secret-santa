import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cake, ClipboardList, Gift, Users, ArrowUpRight } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import * as api from '../lib/api';
import { Page } from '../components/PageHeader';
import { DashboardSkeleton } from '../components/Skeleton';
import NextBirthdayCard from '../components/NextBirthdayCard';
import { useCountUp } from '../lib/useCountUp';
import { daysUntilBirthday, ageTurningNext, formatBirthday } from '../lib/dates';

export default function DashboardView() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { profile, currentHousehold, currentHouseholdId, user } = useAuth();
  const [members, setMembers] = useState([]);
  const [myCount, setMyCount] = useState(0);
  const [resCount, setResCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!currentHouseholdId) return;
    setLoading(true);
    try {
      const [mem, mine, res] = await Promise.all([
        api.getMembers(currentHouseholdId),
        api.getMyItems(currentHouseholdId),
        api.getMyReservations(),
      ]);
      setMembers(mem);
      setMyCount(mine.length);
      setResCount((res || []).filter((r) => r.household_id === currentHouseholdId).length);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentHouseholdId]);

  useEffect(() => {
    load();
  }, [load]);

  const birthdays = members
    .filter((m) => m.birthday)
    .map((m) => ({ ...m, days: daysUntilBirthday(m.birthday), age: ageTurningNext(m.birthday) }))
    .sort((a, b) => a.days - b.days);

  function whenLabel(days) {
    if (days === 0) return t('dash.birthdayToday');
    if (days === 1) return t('dash.birthdayTomorrow');
    return t('dash.birthdayInDays', { days });
  }

  const hero = birthdays[0];
  const rest = birthdays.slice(1, 6);

  const stats = [
    { icon: ClipboardList, value: myCount, label: t('nav.wishlist'), to: '/app/list' },
    { icon: Gift, value: resCount, label: t('nav.reservations'), to: '/app/reservations' },
    { icon: Users, value: members.length, label: t('nav.members'), to: '/app/members' },
  ];

  return (
    <Page>
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold mb-2">
          {currentHousehold?.name}
        </p>
        <h1 className="font-serif text-[26px] sm:text-3xl font-medium tracking-tight text-fg leading-tight">
          {t('dash.greeting', { name: profile?.display_name || '' })}
        </h1>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Hero: next birthday */}
          {hero && (
            <NextBirthdayCard
              person={hero}
              isMe={hero.userId === user?.id}
              whenLabel={whenLabel(hero.days)}
              onView={() => navigate('/app/members')}
            />
          )}

          {/* Stats */}
          <div className="card grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-line mb-10 overflow-hidden">
            {stats.map(({ icon: Icon, value, label, to }, i) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="group flex items-center gap-4 p-5 sm:p-6 text-left hover:bg-panel-2 transition animate-slide-up"
                style={{ animationDelay: `${i * 70}ms`, animationFillMode: 'backwards' }}
              >
                <Icon className="w-5 h-5 text-gold shrink-0" strokeWidth={1.8} />
                <div className="min-w-0 flex-1">
                  <StatNumber value={value} />
                  <p className="text-xs text-mute mt-1.5 uppercase tracking-wide">{label}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-mute opacity-0 group-hover:opacity-100 transition" />
              </button>
            ))}
          </div>

          {/* More upcoming birthdays */}
          {!hero ? (
            <div className="card p-6">
              <p className="text-sm text-mute">{t('dash.noBirthdays')}</p>
            </div>
          ) : rest.length > 0 ? (
            <>
              <h2 className="font-serif text-lg font-medium text-fg flex items-center gap-2.5 mb-4">
                <Cake className="w-[18px] h-[18px] text-gold" strokeWidth={1.8} />
                {t('dash.upcomingBirthdays')}
              </h2>
              <div className="card overflow-hidden">
                <ul className="divide-y divide-line">
                  {rest.map((m, i) => {
                    const isMe = m.userId === user?.id;
                    const today = m.days === 0;
                    const soon = m.days <= 14;
                    return (
                      <li
                        key={m.userId}
                        className="flex items-center gap-4 px-5 sm:px-6 py-4 animate-slide-up"
                        style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'backwards' }}
                      >
                        <div
                          className={`w-11 h-11 rounded-full grid place-items-center font-serif font-semibold shrink-0 border ${
                            today ? 'bg-gold text-paper border-gold' : 'bg-panel-2 text-fg border-line'
                          }`}
                        >
                          {(m.displayName[0] || '?').toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-fg truncate">
                            {m.displayName}{' '}
                            {isMe && <span className="text-mute font-normal">· {t('common.you')}</span>}
                          </p>
                          <p className="text-xs text-mute mt-0.5">
                            {formatBirthday(m.birthday, lang)}
                            {m.age ? ` · ${t('dash.turning', { age: m.age })}` : ''}
                          </p>
                        </div>
                        <span
                          className={`text-sm font-medium tabular-nums ${
                            today ? 'text-gold' : soon ? 'text-fg' : 'text-mute'
                          }`}
                        >
                          {whenLabel(m.days)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </>
          ) : null}
        </>
      )}
    </Page>
  );
}

function StatNumber({ value }) {
  const animated = useCountUp(value);
  return (
    <p className="font-serif text-2xl font-medium text-fg leading-none tabular-nums">{animated}</p>
  );
}
