'use client';

import { ViewTransition, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Gift, Lock } from 'lucide-react';
import { Page } from '@/components/PageHeader';
import WishCards from '@/components/WishCards';
import { useI18n } from '@/i18n/client';
import { daysUntilBirthday, formatBirthday, whenLabel } from '@/lib/dates';
import type { HouseholdItem } from '@/server/queries/wishlist';

type Member = { userId: string; displayName: string; birthday: string | null };

export default function MemberWishlist({ member, items }: { member: Member; items: HouseholdItem[] }) {
  const { t, lang } = useI18n();
  const days = daysUntilBirthday(member.birthday);

  return (
    <Page>
      <MemberHeader userId={member.userId}>
        <Link
          href="/app/members"
          className="press inline-flex items-center gap-1.5 min-h-11 pl-3 pr-4 rounded-full bg-white text-brand-ink text-[15px] font-semibold"
        >
          <ArrowLeft className="w-[18px] h-[18px]" strokeWidth={2.4} aria-hidden="true" /> {t('common.back')}
        </Link>
        <div className="mt-4 animate-fade-in">
          {member.birthday && days !== null && (
            <p className="eyebrow" suppressHydrationWarning>
              {formatBirthday(member.birthday, lang)} · {whenLabel(t, days)}
            </p>
          )}
          <h1 className="heading text-[26px] sm:text-[30px] mt-1.5 break-words">
            {t('member.listOf', { name: member.displayName })}
          </h1>
          <p className="flex items-center gap-2 mt-3 text-[15px]">
            <Lock className="w-4 h-4 shrink-0" aria-hidden="true" />
            {t('member.private', { name: member.displayName })}
          </p>
        </div>
      </MemberHeader>

      {items.length === 0 ? (
        <div className="card p-6 text-center animate-rise [animation-delay:200ms]">
          <span className="w-12 h-12 rounded-2xl bg-panel-2 text-mute grid place-items-center mx-auto mb-3" aria-hidden="true">
            <Gift className="w-6 h-6" />
          </span>
          <p className="text-[15px] text-mute">{t('member.empty', { name: member.displayName })}</p>
        </div>
      ) : (
        <WishCards items={items} ownerName={member.displayName} />
      )}
    </Page>
  );
}

// The raspberry header. Same view-transition name as the member's card on the
// home and members pages, so that card morphs into this header on navigation.
export function MemberHeader({ userId, children }: { userId: string; children?: ReactNode }) {
  return (
    <ViewTransition name={`member-${userId}`} share="morph" default="none">
      <header className="relative overflow-hidden rounded-3xl bg-brand text-white p-5 sm:p-6 mb-5 min-h-[180px]">
        <span aria-hidden="true" className="absolute right-5 top-5 w-5 h-5 rounded-full bg-sun animate-float" />
        <span
          aria-hidden="true"
          className="absolute right-12 top-12 w-2.5 h-2.5 rounded-[3px] bg-white/80 rotate-12 animate-float [animation-delay:600ms]"
        />
        <div className="relative">{children}</div>
      </header>
    </ViewTransition>
  );
}
