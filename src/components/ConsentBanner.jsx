import React from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { useConsent } from '../context/ConsentContext';

// Shown until the visitor accepts or declines optional analytics.
export default function ConsentBanner() {
  const { t } = useI18n();
  const { consent, accept, decline } = useConsent();
  if (consent !== null) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4 pb-safe animate-slide-up">
      <div className="max-w-3xl mx-auto card shadow-card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="hidden sm:grid place-items-center w-9 h-9 rounded-xl bg-goldsoft text-gold shrink-0">
            <Cookie className="w-5 h-5" />
          </span>
          <p className="text-sm text-mute leading-relaxed">
            {t('consent.message')}{' '}
            <Link to="/privacy" className="link">
              {t('legal.privacy')}
            </Link>
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={decline} className="btn-secondary px-4 py-2 text-sm">
            {t('consent.decline')}
          </button>
          <button onClick={accept} className="btn-primary px-4 py-2 text-sm">
            {t('consent.accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
