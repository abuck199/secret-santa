import React, { useEffect, useState, useCallback } from 'react';
import { Cake, ClipboardList, Gift, Users, ArrowRight } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import * as api from '../lib/api';
import { Page } from '../components/PageHeader';
import { InlineLoading } from '../components/Loading';
import { daysUntilBirthday, ageTurningNext, formatBirthday } from '../lib/dates';

export default function DashboardView({ setView }) {
  const { t, lang } = useI18n();
  const { profile, currentHouseholdId, user } = useAuth();
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
    .map((m) => ({
      ...m,
      days: daysUntilBirthday(m.birthday),
      age: ageTurningNext(m.birthday),
    }))
    .sort((a, b) => a.days - b.days)
    .slice(0, 6);

  function whenLabel(days) {
    if (days === 0) return t('dash.birthdayToday');
    if (days === 1) return t('dash.birthdayTomorrow');
    return t('dash.birthdayInDays', { days });
  }

  return (
    <Page>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 tracking-tight mb-6">
        {t('dash.greeting', { name: profile?.display_name || '' })}
      </h1>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <StatCard
          icon={ClipboardList}
          tint="brand"
          value={myCount}
          label={t('dash.myListCount', { count: myCount })}
          onClick={() => setView('wishlist')}
        />
        <StatCard
          icon={Gift}
          tint="accent"
          value={resCount}
          label={t('dash.reservedCount', { count: resCount })}
          onClick={() => setView('reservations')}
        />
        <StatCard
          icon={Users}
          tint="emerald"
          value={members.length}
          label={t('dash.seeMembers')}
          onClick={() => setView('members')}
        />
      </div>

      {/* Birthdays */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Cake className="w-5 h-5 text-accent-500" />
          <h2 className="text-lg font-bold text-ink-900">{t('dash.upcomingBirthdays')}</h2>
        </div>

        {loading ? (
          <InlineLoading />
        ) : birthdays.length === 0 ? (
          <p className="text-sm text-ink-400 py-4">{t('dash.noBirthdays')}</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {birthdays.map((m) => {
              const isMe = m.userId === user?.id;
              const soon = m.days <= 14;
              return (
                <li key={m.userId} className="flex items-center gap-3 py-3">
                  <div
                    className={`w-10 h-10 rounded-full grid place-items-center font-bold text-white shrink-0 ${
                      m.days === 0 ? 'bg-accent-500' : 'bg-brand-gradient'
                    }`}
                  >
                    {(m.displayName[0] || '?').toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink-900 truncate">
                      {m.displayName} {isMe && <span className="text-ink-400 font-normal">({t('common.you')})</span>}
                    </p>
                    <p className="text-xs text-ink-400">
                      {formatBirthday(m.birthday, lang)}
                      {m.age ? ` · ${t('dash.turning', { age: m.age })}` : ''}
                    </p>
                  </div>
                  <span
                    className={`chip ${
                      m.days === 0
                        ? 'bg-accent-100 text-accent-700'
                        : soon
                        ? 'bg-brand-100 text-brand-700'
                        : 'bg-ink-100 text-ink-500'
                    }`}
                  >
                    {whenLabel(m.days)}
                  </span>
                  {!isMe && (
                    <button
                      onClick={() => setView('members')}
                      className="hidden sm:inline-flex text-ink-400 hover:text-brand-600"
                      title={t('dash.viewList')}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Page>
  );
}

function StatCard({ icon: Icon, value, label, tint, onClick }) {
  const tints = {
    brand: 'bg-brand-100 text-brand-600',
    accent: 'bg-accent-100 text-accent-600',
    emerald: 'bg-emerald-100 text-emerald-600',
  };
  return (
    <button
      onClick={onClick}
      className="card p-4 flex items-center gap-3 text-left hover:shadow-card transition"
    >
      <span className={`w-11 h-11 rounded-2xl grid place-items-center shrink-0 ${tints[tint]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold text-ink-900 leading-none">{value}</p>
        <p className="text-xs text-ink-500 mt-1 truncate">{label}</p>
      </div>
    </button>
  );
}
