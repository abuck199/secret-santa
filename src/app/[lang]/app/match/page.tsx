import type { Metadata } from 'next';
import PageHeader, { Page } from '@/components/PageHeader';
import { getT } from '@/i18n/server';
import { getCurrentHousehold } from '@/server/queries/households';
import { getMyAssignment } from '@/server/queries/santa';
import { getHouseholdWishlists } from '@/server/queries/wishlist';
import ReceiverList from './receiver-list';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t('nav.assignment') };
}

export default async function MatchPage() {
  const household = await getCurrentHousehold();
  if (!household) return null;
  const t = await getT();

  const header = <PageHeader eyebrow={t('nav.assignment')} title={t('assign.title')} />;
  if (!household.secretSantaEnabled) {
    return (
      <Page>
        {header}
        <div className="card p-12 text-center text-mute">{t('assign.disabled')}</div>
      </Page>
    );
  }

  const assignment = await getMyAssignment(household.id);
  if (!assignment) {
    return (
      <Page>
        {header}
        <div className="card p-12 text-center text-mute">{t('assign.notDrawn')}</div>
      </Page>
    );
  }

  const items = (await getHouseholdWishlists(household.id)).filter((it) => it.ownerId === assignment.receiverId);
  return (
    <Page>
      {header}
      <div className="card lift p-7 mb-6 text-center bg-goldsoft/40 animate-scale-in">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold mb-3">{t('assign.subtitle')}</p>
        <p className="font-serif text-2xl sm:text-3xl font-medium text-fg tracking-tight">{assignment.receiverName}</p>
      </div>
      <h2 className="font-serif text-lg font-medium text-fg mb-3">{t('assign.theirList')}</h2>
      <ReceiverList key={assignment.receiverId} initialItems={items} />
    </Page>
  );
}
