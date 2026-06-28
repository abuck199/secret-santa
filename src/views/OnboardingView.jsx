import React, { useState } from 'react';
import { Home, Ticket, Loader2, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import * as api from '../lib/api';
import Brand from '../components/Brand';
import LanguageToggle from '../components/LanguageToggle';

// Shown when a signed-in user belongs to no household yet. Also reachable from
// the nav ("New / join household") via the `embedded` + `onDone` props.
export default function OnboardingView({ embedded = false, onDone }) {
  const { t } = useI18n();
  const { afterHouseholdChange, signOut } = useAuth();
  const [tab, setTab] = useState('create');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return toast.error(t('common.required'));
    setLoading(true);
    try {
      const hid = await api.createHousehold(name.trim());
      await afterHouseholdChange(hid);
      toast.success(t('onboard.created'));
      onDone?.();
    } catch (err) {
      toast.error(err.message || t('err.generic'));
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    if (!code.trim()) return toast.error(t('common.required'));
    setLoading(true);
    try {
      const hid = await api.acceptInvite(code.trim());
      const target = await afterHouseholdChange(hid);
      const list = await api.getMyHouseholds();
      const h = list.find((x) => x.id === target);
      toast.success(t('onboard.joined', { name: h?.name || '' }));
      onDone?.();
    } catch (err) {
      toast.error(t('onboard.invalidCode'));
    } finally {
      setLoading(false);
    }
  }

  const body = (
    <div className="card p-6 sm:p-8 animate-scale-in">
      <div className="flex gap-1 p-1 bg-ink-100 rounded-xl mb-6">
        <button
          onClick={() => setTab('create')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${
            tab === 'create' ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-500'
          }`}
        >
          <Home className="w-4 h-4" /> {t('onboard.createTab')}
        </button>
        <button
          onClick={() => setTab('join')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${
            tab === 'join' ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-500'
          }`}
        >
          <Ticket className="w-4 h-4" /> {t('onboard.joinTab')}
        </button>
      </div>

      {tab === 'create' ? (
        <form onSubmit={handleCreate}>
          <label className="label">{t('onboard.householdName')}</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('onboard.householdPlaceholder')}
            maxLength={60}
          />
          <button className="btn-primary w-full mt-5" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('onboard.createCta')}
          </button>
        </form>
      ) : (
        <form onSubmit={handleJoin}>
          <label className="label">{t('onboard.inviteCode')}</label>
          <input
            className="input font-mono tracking-wide"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="a1b2c3d4…"
          />
          <button className="btn-primary w-full mt-5" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('onboard.joinCta')}
          </button>
        </form>
      )}
    </div>
  );

  if (embedded) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-2xl font-extrabold text-ink-900 mb-1">
          {t('nav.newHousehold')}
        </h1>
        <p className="text-ink-500 text-sm mb-6">{t('onboard.subtitle')}</p>
        {body}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50 bg-mesh flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <Brand size="md" />
          <LanguageToggle />
        </div>
        <div className="mb-5">
          <h1 className="text-2xl font-extrabold text-ink-900">{t('onboard.title')}</h1>
          <p className="text-ink-500 text-sm mt-1">{t('onboard.subtitle')}</p>
        </div>
        {body}
        <button
          onClick={signOut}
          className="mx-auto mt-6 flex items-center gap-2 text-sm text-ink-400 hover:text-ink-600"
        >
          <LogOut className="w-4 h-4" /> {t('auth.signOut')}
        </button>
      </div>
    </div>
  );
}
