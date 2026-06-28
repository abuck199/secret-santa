import React, { useState, useEffect } from 'react';
import { Save, Lock, Loader2, Globe, Sun } from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import * as api from '../lib/api';
import { Page } from '../components/PageHeader';
import PageHeader from '../components/PageHeader';
import LanguageToggle from '../components/LanguageToggle';
import ThemeToggle from '../components/ThemeToggle';
import DatePicker from '../components/DatePicker';

export default function ProfileView() {
  const { t } = useI18n();
  const { profile, user, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [birthday, setBirthday] = useState(profile?.birthday || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.display_name || '');
    setBirthday(profile?.birthday || '');
  }, [profile]);

  async function saveProfile(e) {
    e.preventDefault();
    if (!displayName.trim()) return toast.error(t('common.required'));
    setSavingProfile(true);
    try {
      await api.updateProfile({ display_name: displayName.trim(), birthday: birthday || null });
      await refreshProfile();
      toast.success(t('profile.saved'));
    } catch (err) {
      toast.error(t('err.generic'));
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    if (password.length < 6) return toast.error(t('auth.passwordShort'));
    if (password !== confirm) return toast.error(t('auth.passwordsNoMatch'));
    setSavingPw(true);
    try {
      await api.updatePassword(password);
      setPassword('');
      setConfirm('');
      toast.success(t('auth.passwordUpdated'));
    } catch (err) {
      toast.error(err.message || t('err.generic'));
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <Page>
      <PageHeader eyebrow={t('nav.profile')} title={t('profile.title')} />

      <form onSubmit={saveProfile} className="card p-5 mb-4">
        <div className="mb-4">
          <label className="label">{t('profile.displayName')}</label>
          <input className="input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={60} />
        </div>
        <div className="mb-2">
          <label className="label">{t('profile.birthday')}</label>
          <DatePicker value={birthday} onChange={setBirthday} placeholder={t('profile.birthday')} />
          <p className="text-xs text-mute mt-1.5">{t('profile.birthdayHint')}</p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-mute">{user?.email}</p>
          <button className="btn-primary" disabled={savingProfile}>
            {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {t('common.save')}
          </button>
        </div>
      </form>

      <div className="card p-5 mb-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-serif text-lg font-medium text-fg flex items-center gap-2">
            <Sun className="w-[18px] h-[18px] text-gold" /> {t('profile.language')}
          </h2>
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-line">
          <span className="text-sm text-mute flex items-center gap-2">
            <Globe className="w-4 h-4" /> {t('lang.label')}
          </span>
          <LanguageToggle />
        </div>
      </div>

      <form onSubmit={changePassword} className="card p-5">
        <h2 className="font-serif text-lg font-medium text-fg mb-3 flex items-center gap-2">
          <Lock className="w-[18px] h-[18px] text-gold" /> {t('profile.changePassword')}
        </h2>
        <div className="mb-3">
          <label className="label">{t('auth.newPassword')}</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="••••••••"
          />
        </div>
        <div className="mb-4">
          <label className="label">{t('auth.confirmPassword')}</label>
          <input
            type="password"
            className="input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            placeholder="••••••••"
          />
        </div>
        <button className="btn-secondary" disabled={savingPw}>
          {savingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          {t('profile.changePassword')}
        </button>
      </form>
    </Page>
  );
}
