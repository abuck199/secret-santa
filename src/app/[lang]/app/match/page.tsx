import type { Metadata } from 'next';
import { WrappedGift } from '@/components/Celebration';
import PageHeader, { Page } from '@/components/PageHeader';
import { getT } from '@/i18n/server';
import { getCurrentHousehold } from '@/server/queries/households';
import { getMyAssignment } from '@/server/queries/santa';
import { getHouseholdWishlists } from '@/server/queries/wishlist';
import DrawReveal from './draw-reveal';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t('nav.assignment') };
}

export default async function MatchPage() {
  const household = await getCurrentHousehold();
  if (!household) return null;
  const t = await getT();
  const header = <PageHeader eyebrow={`Secret Santa · ${household.name}`} title={t('assign.title')} />;

  const assignment = household.secretSantaEnabled ? await getMyAssignment(household.id) : null;
  if (!assignment) {
    return (
      <Page>
        {header}
        <div className="card p-8 text-center animate-rise [animation-delay:100ms]">
          <WrappedGift box="rgb(var(--mute) / 0.35)" ribbon="rgb(var(--mute))" className="w-16 h-16 mx-auto mb-3" />
          <p className="text-[15px] text-mute">
            {household.secretSantaEnabled ? t('assign.notDrawn') : t('assign.disabled')}
          </p>
        </div>
      </Page>
    );
  }

  const items = (await getHouseholdWishlists(household.id)).filter((it) => it.ownerId === assignment.receiverId);
  return (
    <Page>
      {header}
      <DrawReveal key={assignment.receiverId} receiverName={assignment.receiverName} items={items} />
    </Page>
  );
}
