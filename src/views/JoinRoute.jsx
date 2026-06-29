import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import * as api from '../lib/api';
import Loading from '../components/Loading';

const PENDING_INVITE_KEY = 'souhaity:pendingInvite';

// Handles /join/:code. If signed in, accept immediately and go to the app;
// otherwise stash the code and send the visitor to sign up (AuthContext
// consumes the pending invite once they authenticate).
export default function JoinRoute() {
  const { code } = useParams();
  const { session, afterHouseholdChange } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    (async () => {
      try {
        localStorage.setItem(PENDING_INVITE_KEY, code);
      } catch (_) {}

      if (!session) {
        navigate('/signup', { replace: true });
        return;
      }
      try {
        const hid = await api.acceptInvite(code);
        try {
          localStorage.removeItem(PENDING_INVITE_KEY);
        } catch (_) {}
        const target = await afterHouseholdChange(hid);
        const list = await api.getMyHouseholds();
        const h = list.find((x) => x.id === target);
        toast.success(t('onboard.joined', { name: h?.name || '' }));
      } catch (e) {
        toast.error(t('onboard.invalidCode'));
      }
      navigate('/app', { replace: true });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Loading />;
}
