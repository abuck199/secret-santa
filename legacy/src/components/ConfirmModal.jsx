import React, { useEffect, useId, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

// Controlled confirmation dialog. Pass `open`, `onConfirm`, `onCancel`.
// Accessible: role="dialog" + aria-modal, Escape to close, focus moves into
// the dialog on open and is restored to the trigger on close, and Tab is
// trapped within the dialog while it is open.
export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}) {
  const { t } = useI18n();
  const titleId = useId();
  const msgId = useId();
  const dialogRef = useRef(null);
  const confirmRef = useRef(null);
  const restoreRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement;
    // Move focus into the dialog (the primary action).
    confirmRef.current?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCancel?.();
        return;
      }
      if (e.key === 'Tab') {
        const focusables = dialogRef.current?.querySelectorAll(
          'button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      // Restore focus to whatever opened the dialog.
      if (restoreRef.current instanceof HTMLElement) restoreRef.current.focus();
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onCancel} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={message ? msgId : undefined}
        className="relative card p-6 w-full max-w-sm animate-scale-in"
      >
        <button
          onClick={onCancel}
          aria-label={t('common.cancel')}
          className="absolute right-4 top-4 text-mute hover:text-fg"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
        <div
          className={`w-11 h-11 rounded-xl grid place-items-center mb-3 ${
            danger ? 'bg-red-500/10 text-red-600' : 'bg-goldsoft text-gold'
          }`}
        >
          <AlertTriangle className="w-6 h-6" aria-hidden="true" />
        </div>
        <h3 id={titleId} className="font-serif text-xl font-semibold text-fg">{title}</h3>
        {message && <p id={msgId} className="text-sm text-mute mt-1.5 leading-relaxed">{message}</p>}
        <div className="flex gap-2 mt-5">
          <button className="btn-secondary flex-1" onClick={onCancel} disabled={loading}>
            {t('common.cancel')}
          </button>
          <button
            ref={confirmRef}
            className={`${danger ? 'btn-danger' : 'btn-primary'} flex-1`}
            onClick={onConfirm}
            disabled={loading}
          >
            {confirmLabel || t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
