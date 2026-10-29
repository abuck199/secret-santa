'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '@/i18n/client';
import { actionErrorMessage } from '@/lib/action-error';
import { deleteAccount, requestDeletionCode } from '@/server/actions/account';

const RESEND_COOLDOWN = 30; // seconds, like the sign-in form

// Deleting an account takes a one-time code emailed to its owner: a session
// left open on a shared computer isn't enough. Opening the dialog sends the
// code; the delete button needs the 6 digits.
export default function DeleteAccountDialog({ email, onClose }: { email: string; onClose: () => void }) {
  const { t } = useI18n();
  const titleId = useId();
  const codeId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  async function sendCode() {
    setCooldown(RESEND_COOLDOWN);
    const res = await requestDeletionCode();
    if (!res.ok) toast.error(actionErrorMessage(t, res));
  }

  // Send the first code once, on open (a ref so dev StrictMode doesn't send two).
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    sendCode();
    inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !deleting) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [deleting, onClose]);

  async function confirm(e: FormEvent) {
    e.preventDefault();
    if (code.length !== 6 || deleting) return;
    setDeleting(true);
    setError('');
    const res = await deleteAccount(code);
    if (!res.ok) {
      setDeleting(false);
      setCode('');
      setError(actionErrorMessage(t, res));
      inputRef.current?.focus();
      return;
    }
    toast.success(t('profile.accountDeleted'));
    // Full page load (like sign-out) so no hidden route keeps this account's
    // data. A short delay lets the toast show first.
    setTimeout(() => {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload on purpose
      window.location.href = '/';
    }, 800);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => !deleting && onClose()} />
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative card p-6 w-full max-w-sm animate-scale-in">
        <button
          onClick={onClose}
          disabled={deleting}
          aria-label={t('common.cancel')}
          className="absolute right-4 top-4 text-mute hover:text-fg"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
        <div className="w-11 h-11 rounded-xl grid place-items-center mb-3 bg-red-500/10 text-red-600">
          <AlertTriangle className="w-6 h-6" aria-hidden="true" />
        </div>
        <h3 id={titleId} className="font-display text-xl font-semibold text-fg">{t('profile.deleteAccount')}</h3>
        <p className="text-sm text-mute mt-1.5 leading-relaxed">
          {t('profile.deleteAccountDesc')} {t('profile.deleteAccountConfirm')}
        </p>

        <form onSubmit={confirm} className="mt-4">
          <label htmlFor={codeId} className="text-sm text-fg block mb-2 break-words">
            {t('profile.deleteCodeIntro', { email })}
          </label>
          <input
            ref={inputRef}
            id={codeId}
            className={`input text-center font-mono text-2xl tracking-[0.5em] ${error ? 'input-error' : ''}`}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
              if (error) setError('');
            }}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="••••••"
            aria-invalid={!!error}
            aria-describedby={error ? `${codeId}-err` : undefined}
            disabled={deleting}
          />
          {error && <p id={`${codeId}-err`} className="text-xs text-red-500 mt-1.5 text-center">{error}</p>}

          <div className="flex gap-2 mt-5">
            <button type="button" className="btn-secondary flex-1" onClick={onClose} disabled={deleting}>
              {t('common.cancel')}
            </button>
            <button className="btn-danger flex-1" disabled={deleting || code.length !== 6} aria-busy={deleting}>
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : t('profile.deleteAccount')}
            </button>
          </div>
        </form>

        <button
          type="button"
          onClick={sendCode}
          disabled={cooldown > 0 || deleting}
          className="w-full mt-3 text-sm text-mute hover:text-fg disabled:hover:text-mute disabled:cursor-not-allowed tabular-nums"
        >
          {cooldown > 0 ? t('auth.resendIn', { s: cooldown }) : t('auth.resend')}
        </button>
      </div>
    </div>
  );
}
