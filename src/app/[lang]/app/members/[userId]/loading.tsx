'use client';

import { useParams } from 'next/navigation';
import { Page } from '@/components/PageHeader';
import { MemberHeader } from './member-wishlist';

// Instant navigation: the raspberry header shows (and the card morphs into it)
// while the list loads.
export default function MemberLoading() {
  const { userId } = useParams<{ userId: string }>();
  return (
    <Page>
      <MemberHeader userId={userId} />
      <div className="space-y-3" role="status" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-[132px] rounded-3xl" />
        ))}
      </div>
    </Page>
  );
}
