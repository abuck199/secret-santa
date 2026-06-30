import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import * as api from '../lib/api';
import { useI18n } from '../i18n/I18nContext';

const HOUSEHOLD_KEY = 'thatwish:household';
const PENDING_INVITE_KEY = 'thatwish:pendingInvite';
// Remembers which users we've already shown the "email confirmed" welcome to,
// so re-clicking the confirmation link doesn't replay the toast.
const WELCOMED_KEY = 'thatwish:welcomed';

// Capture an ?invite=CODE param as early as possible, then clean the URL.
(function captureInvite() {
  try {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('invite');
    if (code) {
      localStorage.setItem(PENDING_INVITE_KEY, code);
      params.delete('invite');
      const qs = params.toString();
      window.history.replaceState(
        {},
        '',
        window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash
      );
    }
  } catch (_) {}
})();

// Captured at module load (before Supabase strips auth params from the URL):
// did the user just arrive from clicking the email-confirmation link?
const SIGNUP_CONFIRMED_ON_LOAD =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('confirmed') === '1';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [households, setHouseholds] = useState([]);
  const [currentHouseholdId, setCurrentHouseholdId] = useState(() => {
    try {
      return localStorage.getItem(HOUSEHOLD_KEY) || null;
    } catch (_) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [recovery, setRecovery] = useState(false);
  const initialized = useRef(false);
  const confirmedRef = useRef(SIGNUP_CONFIRMED_ON_LOAD);
  const { t, lang } = useI18n();

  const persistHousehold = useCallback((id) => {
    setCurrentHouseholdId(id);
    try {
      if (id) localStorage.setItem(HOUSEHOLD_KEY, id);
      else localStorage.removeItem(HOUSEHOLD_KEY);
    } catch (_) {}
  }, []);

  const loadProfile = useCallback(async (activeSession) => {
    let prof = await api.getMyProfile();
    const meta = activeSession?.user?.user_metadata || {};
    // Backfill birthday captured at signup (the trigger only copies display_name).
    if (prof && !prof.birthday && meta.birthday) {
      try {
        prof = await api.updateProfile({ birthday: meta.birthday });
      } catch (_) {}
    }
    setProfile(prof);
    return prof;
  }, []);

  const refreshProfile = useCallback(async () => {
    const prof = await api.getMyProfile();
    setProfile(prof);
    return prof;
  }, []);

  const refreshHouseholds = useCallback(async () => {
    const list = await api.getMyHouseholds();
    setHouseholds(list);
    return list;
  }, []);

  const consumePendingInvite = useCallback(async () => {
    let code;
    try {
      code = localStorage.getItem(PENDING_INVITE_KEY);
    } catch (_) {}
    if (!code) return null;
    try {
      const hid = await api.acceptInvite(code);
      try {
        localStorage.removeItem(PENDING_INVITE_KEY);
      } catch (_) {}
      return hid;
    } catch (_) {
      // Leave it for the user to paste manually; clear so it doesn't loop.
      try {
        localStorage.removeItem(PENDING_INVITE_KEY);
      } catch (_) {}
      return null;
    }
  }, []);

  // Bootstrap session + auth listener.
  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session || null);
      if (!data.session) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!active) return;
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      setSession(newSession || null);
      if (!newSession) {
        setProfile(null);
        setHouseholds([]);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // When a session appears, hydrate profile + households (and any invite).
  useEffect(() => {
    let active = true;
    if (!session) {
      initialized.current = false;
      return;
    }
    (async () => {
      setLoading(true);
      try {
        await loadProfile(session);
        const invitedHid = await consumePendingInvite();
        const list = await refreshHouseholds();
        if (!active) return;
        const ids = list.map((h) => h.id);
        let target = invitedHid || currentHouseholdId;
        if (!target || !ids.includes(target)) target = ids[0] || null;
        persistHousehold(target);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Auth hydration failed', e);
      } finally {
        if (active) {
          setLoading(false);
          initialized.current = true;
        }
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  // Keep the email language (user_metadata.lang) in sync with the app language,
  // so password-reset emails arrive in the language the user is actually using.
  useEffect(() => {
    const u = session?.user;
    if (!u) return;
    if ((u.user_metadata?.lang || '') === lang) return;
    supabase.auth.updateUser({ data: { lang } }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, session?.user?.id]);

  // After the email-confirmation redirect, greet the user once they're signed in,
  // then strip the `?confirmed=1` flag from the URL. We only celebrate a genuine
  // first-time confirmation: re-clicking the link (or replaying an old one) keeps
  // putting `?confirmed=1` back, so gate the toast on the server's confirmation
  // timestamp being recent AND a one-time per-user marker.
  useEffect(() => {
    if (!confirmedRef.current || !session?.user) return;
    confirmedRef.current = false;

    const stripParam = () => {
      try {
        const u = new URL(window.location.href);
        u.searchParams.delete('confirmed');
        window.history.replaceState({}, '', u.pathname + u.search + u.hash);
      } catch (_) {}
    };

    const uid = session.user.id;
    const confirmedAt =
      session.user.email_confirmed_at || session.user.confirmed_at || null;
    const isRecent =
      !!confirmedAt &&
      Date.now() - new Date(confirmedAt).getTime() < 10 * 60 * 1000;

    let welcomed = {};
    try {
      welcomed = JSON.parse(localStorage.getItem(WELCOMED_KEY) || '{}');
    } catch (_) {}

    if (isRecent && !welcomed[uid]) {
      welcomed[uid] = true;
      try {
        localStorage.setItem(WELCOMED_KEY, JSON.stringify(welcomed));
      } catch (_) {}
      toast.success(t('auth.emailConfirmed'));
    }
    stripParam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const switchHousehold = useCallback(
    (id) => {
      if (households.some((h) => h.id === id)) persistHousehold(id);
    },
    [households, persistHousehold]
  );

  const afterHouseholdChange = useCallback(
    async (targetId) => {
      const list = await refreshHouseholds();
      const ids = list.map((h) => h.id);
      const target = targetId && ids.includes(targetId) ? targetId : ids[0] || null;
      persistHousehold(target);
      return target;
    },
    [refreshHouseholds, persistHousehold]
  );

  const signOut = useCallback(async () => {
    await api.signOut();
    setSession(null);
    setProfile(null);
    setHouseholds([]);
    persistHousehold(null);
    setRecovery(false);
  }, [persistHousehold]);

  const currentHousehold = useMemo(
    () => households.find((h) => h.id === currentHouseholdId) || null,
    [households, currentHouseholdId]
  );

  const value = useMemo(
    () => ({
      loading,
      session,
      user: session?.user || null,
      profile,
      setProfile,
      households,
      currentHousehold,
      currentHouseholdId,
      role: currentHousehold?.role || null,
      isAdmin: currentHousehold?.role === 'admin',
      isOwner: currentHousehold?.owner_id === session?.user?.id,
      hasHouseholds: households.length > 0,
      recovery,
      clearRecovery: () => setRecovery(false),
      switchHousehold,
      afterHouseholdChange,
      refreshHouseholds,
      refreshProfile,
      signOut,
    }),
    [
      loading,
      session,
      profile,
      households,
      currentHousehold,
      currentHouseholdId,
      recovery,
      switchHousehold,
      afterHouseholdChange,
      refreshHouseholds,
      refreshProfile,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
