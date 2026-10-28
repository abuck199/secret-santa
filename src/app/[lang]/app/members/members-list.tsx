'use client';

import { useMemo, useState } from 'react';
import { Cake, Search } from 'lucide-react';
import GiftRow, { useReservations } from '@/components/GiftRow';
import PageHeader, { Page } from '@/components/PageHeader';
import { useI18n } from '@/i18n/client';
import { formatBirthday } from '@/lib/dates';
import type { HouseholdItem } from '@/server/queries/wishlist';

type Person = {
  userId: string;
  displayName: string;
  birthday: string | null;
  role: 'admin' | 'member';
  isMe: boolean;
};

export default function MembersList({ members, initialItems }: { members: Person[]; initialItems: HouseholdItem[] }) {
  const { t, lang } = useI18n();
  const { items, busy, toggle } = useReservations(initialItems);
  const [query, setQuery] = useState('');

  // Items arrive in display order; group them per owner.
  const itemsByUser = useMemo(() => {
    const grouped: Record<string, HouseholdItem[]> = {};
    for (const it of items) (grouped[it.ownerId] ??= []).push(it);
    return grouped;
  }, [items]);

  const q = query.trim().toLowerCase();
  const visibleMembers = useMemo(() => {
    // Everyone else alphabetically, me last.
    const ordered = [...members].sort((a, b) =>
      a.isMe !== b.isMe ? (a.isMe ? 1 : -1) : a.displayName.localeCompare(b.displayName),
    );
    if (!q) return ordered;
    return ordered.filter(
      (m) =>
        m.displayName.toLowerCase().includes(q) ||
        (itemsByUser[m.userId] || []).some((it) => it.item.toLowerCase().includes(q)),
    );
  }, [members, itemsByUser, q]);

  return (
    <Page>
      <PageHeader eyebrow={t('nav.members')} title={t('members.title')} subtitle={t('members.subtitle')} />

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-mute" aria-hidden="true" />
        <input
          type="search"
          className="input pl-11"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('members.search')}
          aria-label={t('members.search')}
        />
      </div>

      <div className="space-y-4">
        {visibleMembers.map((m, idx) => {
          const list = itemsByUser[m.userId] || [];
          return (
            <div
              key={m.userId}
              className="card p-5 sm:p-6 animate-slide-up"
              style={{ animationDelay: `${Math.min(idx, 8) * 50}ms`, animationFillMode: 'backwards' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-fg text-paper font-medium grid place-items-center">
                  {(m.displayName[0] || '?').toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-fg truncate flex items-center gap-2">
                    {m.displayName}
                    {m.isMe && <span className="text-mute font-normal">· {t('common.you')}</span>}
                    {m.role === 'admin' && (
                      <span className="chip bg-panel-2 text-mute border border-line">{t('common.admin')}</span>
                    )}
                  </p>
                  {m.birthday && (
                    <p className="text-xs text-mute flex items-center gap-1 mt-0.5">
                      <Cake className="w-3 h-3" /> {formatBirthday(m.birthday, lang)}
                    </p>
                  )}
                </div>
              </div>

              {list.length === 0 ? (
                <p className="text-sm text-mute pl-1">{t('members.noItems')}</p>
              ) : (
                <div className="space-y-2">
                  {list.map((it) => (
                    <GiftRow key={it.id} item={it} busy={busy.has(it.id)} onToggle={() => toggle(it)} />
                  ))}
                </div>
              )}

              {m.isMe && <p className="text-xs text-mute mt-3 italic">{t('members.ownList')}</p>}
            </div>
          );
        })}
      </div>
    </Page>
  );
}
