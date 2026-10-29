'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useI18n } from '@/i18n/client';

// Controlled confirmation dialog. Pass `open`, `onConfirm`, `onCancel`.
// Accessible: role="dialog" + aria-modal, Escape to close, focus moves into
// the dialog on open and is restored to the trigger on close, and Tab is
// trapped within the dialog while it is open.
export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger = true,
  loading = false,
  icon,
  eyebrow,
  children,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  icon?: ReactNode; // replaces the warning triangle
  eyebrow?: string;
  children?: ReactNode; // extra explanation under the message
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const titleId = useId();
  const msgId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const restore = document.activeElement;
    // Move focus into the dialog (the primary action).
    confirmRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCancel();
        return;
      }
      if (e.key === 'Tab') {
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])',
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
      if (restore instanceof HTMLElement) restore.focus();
    };
  }, [open, onCancel]);

  if (!open) return null;

  // A bottom sheet on phones (thumb-reachable), a centred card from sm up.
  // Buttons stack on phones with the confirm action on top (col-reverse keeps
  // Cancel first in the DOM, so Tab order stays Cancel → Confirm).
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:px-4">
      <div className="absolute inset-0 bg-fg/50 animate-fade-in" onClick={onCancel} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={message ? msgId : undefined}
        className="relative w-full sm:max-w-sm bg-panel rounded-t-[28px] sm:rounded-3xl shadow-card px-5 pt-3 pb-safe sm:p-6 animate-sheet sm:animate-scale-in"
      >
        <span aria-hidden="true" className="sm:hidden block w-11 h-1.5 rounded-full bg-line mx-auto mb-4" />
        <button
          onClick={onCancel}
          aria-label={t('common.cancel')}
          className="absolute right-3 top-3 w-11 h-11 grid place-items-center rounded-full text-mute hover:text-fg hover:bg-panel-2"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
        <div
          className={`w-11 h-11 rounded-2xl grid place-items-center mb-3 ${
            danger ? 'bg-red-500/10 text-red-700' : 'bg-brand-soft text-brand-ink'
          }`}
        >
          {icon ?? <AlertTriangle className="w-6 h-6" aria-hidden="true" />}
        </div>
        {eyebrow && <p className="eyebrow text-brand-ink mb-1.5">{eyebrow}</p>}
        <h3 id={titleId} className="heading text-xl text-fg pr-10">{title}</h3>
        {message && <p id={msgId} className="text-[15px] text-mute mt-2.5 leading-relaxed">{message}</p>}
        {children}
        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6 mb-4 sm:mb-0">
          <button className="btn-secondary flex-1" onClick={onCancel} disabled={loading}>
            {cancelLabel || t('common.cancel')}
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
