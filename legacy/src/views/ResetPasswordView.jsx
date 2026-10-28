import React, { useState, useId } from 'react';
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import * as api from '../lib/api';
import Brand from '../components/Brand';
import LanguageToggle from '../components/LanguageToggle';
import ThemeToggle from '../components/ThemeToggle';

// Shown when Supabase emits PASSWORD_RECOVERY (user clicked the email link).
export default function ResetPasswordView() {
  const { t } = useI18n();
  const { clearRecovery } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const pwId = useId();
  const confirmId = useId();

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 6) return toast.error(t('auth.passwordShort'));
    if (password !== confirm) return toast.error(t('auth.passwordsNoMatch'));
    setLoading(true);
    try {
      await api.updatePassword(password);
      toast.success(t('auth.passwordUpdated'));
      clearRecovery();
    } catch (err) {
      toast.error(err.message || t('err.generic'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-4 py-10">
      <main id="main-content" className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-7">
          <Brand size="md" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
        <form onSubmit={handleSubmit} className="card p-6 sm:p-8 animate-scale-in">
          <h1 className="font-serif text-2xl font-medium tracking-tight text-fg mb-5">
            {t('auth.resetTitle')}
          </h1>

          <div className="mb-4">
            <label htmlFor={pwId} className="label">{t('auth.newPassword')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mute" aria-hidden="true" />
              <input
                id={pwId}
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-11 pr-11"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? t('a11y.hidePassword') : t('a11y.showPassword')}
                aria-pressed={show}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-fg"
              >
                {show ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
              </button>
            </div>
          </div>

          <div className="mb-5">
            <label htmlFor={confirmId} className="label">{t('auth.confirmPassword')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mute" aria-hidden="true" />
              <input
                id={confirmId}
                type={show ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="input pl-11"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          </div>

          <button className="btn-primary w-full" disabled={loading} aria-busy={loading} aria-label={t('auth.updatePassword')}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : t('auth.updatePassword')}
          </button>
        </form>
      </main>
    </div>
  );
}
