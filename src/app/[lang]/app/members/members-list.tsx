'use client';

import { useMemo, useState, ViewTransition } from 'react';
import Link from 'next/link';
import { Check, ChevronRight, Search } from 'lucide-react';
import PageHeader, { Page } from '@/components/PageHeader';
import { useI18n } from '@/i18n/client';
import { daysUntilBirthday, formatBirthday, whenLabel } from '@/lib/dates';
import type { HouseholdItem } from '@/server/queries/wishlist';

type Person = {
  userId: string;
  displayName: string;
  birthday: string | null;
  role: 'admin' | 'member';
  isMe: boolean;
};

// Everyone in the household; tapping a person opens their list.
export default function MembersList({
  householdName,
  members,
  items,
}: {
  householdName: string;
  members: Person[];
  items: HouseholdItem[];
}) {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState('');

  // Per person: how many ideas, and how many of them I'm giving.
  const counts = useMemo(() => {
    const c: Record<string, { ideas: number; mine: number }> = {};
    for (const it of items) {
      const entry = (c[it.ownerId] ??= { ideas: 0, mine: 0 });
      entry.ideas += 1;
      if (it.reservedByMe) entry.mine += 1;
    }
    return c;
  }, [items]);

  const q = query.trim().toLowerCase();
  const visible = useMemo(() => {
    // Everyone else alphabetically, me last.
    const ordered = [...members].sort((a, b) =>
      a.isMe !== b.isMe ? (a.isMe ? 1 : -1) : a.displayName.localeCompare(b.displayName),
    );
    return q ? ordered.filter((m) => m.displayName.toLowerCase().includes(q)) : ordered;
  }, [members, q]);

  return (
    <Page>
      <PageHeader eyebrow={householdName} title={t('members.title')} subtitle={t('members.subtitle')} />

      {members.length > 6 && (
        <div className="relative mb-5 animate-rise">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-mute" aria-hidden="true" />
          <input
            type="search"
            className="input pl-11"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('members.search')}
            aria-label={t('members.search')}
          />
        </div>
      )}

      <ul className="grid sm:grid-cols-2 gap-3">
        {visible.map((m, i) => {
          const { ideas = 0, mine = 0 } = counts[m.userId] ?? {};
          const days = daysUntilBirthday(m.birthday);
          return (
            <li key={m.userId} className="animate-rise" style={{ animationDelay: `${120 + Math.min(i, 8) * 50}ms` }}>
              <ViewTransition name={m.isMe ? undefined : `member-${m.userId}`} share="morph" default="none">
                <Link
                  href={m.isMe ? '/app/list' : `/app/members/${m.userId}`}
                  className="press flex items-center gap-3 min-h-[76px] p-3.5 rounded-3xl bg-panel shadow-soft"
                >
                  <span
                    aria-hidden="true"
                    className="w-12 h-12 shrink-0 rounded-full bg-brand text-white grid place-items-center font-display font-black text-lg"
                  >
                    {(m.displayName[0] || '?').toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-bold text-fg truncate">
                      {m.displayName}
                      {m.isMe && <span className="text-mute font-normal"> · {t('common.you')}</span>}
                    </span>
                    {m.birthday && days !== null && (
                      <span className="block text-sm text-mute" suppressHydrationWarning>
                        {formatBirthday(m.birthday, lang)} · {whenLabel(t, days)}
                      </span>
                    )}
                    <span className="flex flex-wrap gap-1.5 mt-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-brand-soft font-mono text-xs font-semibold text-fg">
                        {ideas === 0
                          ? t('members.ideasNone')
                          : ideas === 1
                            ? t('members.ideasOne')
                            : t('members.ideasMany', { count: ideas })}
                      </span>
                      {mine > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sun font-mono text-xs font-semibold text-fg">
                          <Check className="w-3 h-3" strokeWidth={3} aria-hidden="true" />
                          {t('members.youGiveCount', { count: mine })}
                        </span>
                      )}
                    </span>
                  </span>
                  <ChevronRight className="w-5 h-5 shrink-0 text-mute" strokeWidth={2.4} aria-hidden="true" />
                </Link>
              </ViewTransition>
            </li>
          );
        })}
      </ul>
    </Page>
  );
}
