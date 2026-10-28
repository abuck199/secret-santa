'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Loading from '@/components/Loading';
import { useI18n } from '@/i18n/client';
import { actionErrorMessage } from '@/lib/action-error';
import { acceptInvite } from '@/server/actions/invites';

// Accepts the invite once on arrival (a POST, not part of the page render),
// then lands in the app on that household.
export default function JoinInvite({ code }: { code: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // StrictMode runs effects twice in dev
    ran.current = true;
    acceptInvite(code).then((res) => {
      if (res.ok) toast.success(t('onboard.joined', { name: res.data.householdName }));
      else toast.error(actionErrorMessage(t, res));
      router.replace('/app');
      router.refresh();
    });
  }, [code, router, t]);

  return <Loading />;
}
