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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onCancel} />
      <div className="relative card p-6 w-full max-w-sm animate-scale-in">
        <button onClick={onCancel} className="absolute right-4 top-4 text-mute hover:text-fg">
          <X className="w-5 h-5" />
        </button>
        <div
          className={`w-11 h-11 rounded-xl grid place-items-center mb-3 ${
            danger ? 'bg-red-500/10 text-red-600' : 'bg-goldsoft text-gold'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-xl font-semibold text-fg">{title}</h3>
        {message && <p className="text-sm text-mute mt-1.5 leading-relaxed">{message}</p>}
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
