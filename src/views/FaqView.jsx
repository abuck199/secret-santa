import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { Page } from '../components/PageHeader';
import PageHeader from '../components/PageHeader';

export default function FaqView() {
  const { t } = useI18n();
  const faqs = [1, 2, 3, 4, 5].map((n) => ({ q: t(`faq.q${n}`), a: t(`faq.a${n}`) }));
  const [open, setOpen] = useState(0);

  return (
    <Page>
      <PageHeader eyebrow={t('nav.faq')} title={t('faq.title')} />
      <div className="space-y-2">
        {faqs.map((f, i) => {
          const expanded = open === i;
          const btnId = `faq-q-${i}`;
          const panelId = `faq-a-${i}`;
          return (
            <div key={i} className="card overflow-hidden">
              <button
                id={btnId}
                onClick={() => setOpen(expanded ? -1 : i)}
                aria-expanded={expanded}
                aria-controls={panelId}
                className="w-full flex items-center justify-between gap-3 p-4 text-left"
              >
                <span className="font-medium text-fg">{f.q}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={`w-5 h-5 text-mute transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`}
                />
              </button>
              {expanded && (
                <p
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  className="px-4 pb-4 -mt-1 text-sm text-mute leading-relaxed animate-fade-in"
                >
                  {f.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Page>
  );
}
