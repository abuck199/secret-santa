import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

// Controlled confirmation dialog. Pass `open`, `onConfirm`, `onCancel`.
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
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />
      <div className="relative card p-6 w-full max-w-sm animate-scale-in">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 text-ink-400 hover:text-ink-600"
        >
          <X className="w-5 h-5" />
        </button>
        <div
          className={`w-11 h-11 rounded-xl grid place-items-center mb-3 ${
            danger ? 'bg-accent-100 text-accent-600' : 'bg-brand-100 text-brand-600'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-ink-900">{title}</h3>
        {message && <p className="text-sm text-ink-500 mt-1.5">{message}</p>}
        <div className="flex gap-2 mt-5">
          <button className="btn-secondary flex-1" onClick={onCancel} disabled={loading}>
            {t('common.cancel')}
          </button>
          <button
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
