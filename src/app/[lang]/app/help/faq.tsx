'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import PageHeader, { Page } from '@/components/PageHeader';
import { useI18n } from '@/i18n/client';

export default function Faq() {
  const { t } = useI18n();
  const faqs = [1, 2, 3, 4, 5].map((n) => ({ q: t(`faq.q${n}`), a: t(`faq.a${n}`) }));
  const [open, setOpen] = useState(0);

  return (
    <Page>
      <PageHeader title={t('faq.title')} />
      <div className="space-y-2.5">
        {faqs.map((f, i) => {
          const expanded = open === i;
          const btnId = `faq-q-${i}`;
          const panelId = `faq-a-${i}`;
          return (
            <div
              key={btnId}
              className={`rounded-3xl overflow-hidden animate-rise transition-colors ${
                expanded ? 'bg-panel shadow-soft' : 'bg-panel/60'
              }`}
              style={{ animationDelay: `${60 + i * 60}ms` }}
            >
              <button
                id={btnId}
                onClick={() => setOpen(expanded ? -1 : i)}
                aria-expanded={expanded}
                aria-controls={panelId}
                className="w-full min-h-14 flex items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <span className="text-base font-bold text-fg">{f.q}</span>
                <span
                  aria-hidden="true"
                  className={`w-9 h-9 shrink-0 rounded-full grid place-items-center transition-[transform,background-color] ${
                    expanded ? 'rotate-180 bg-brand text-white' : 'bg-panel-2 text-fg'
                  }`}
                >
                  <ChevronDown className="w-5 h-5" strokeWidth={2.4} />
                </span>
              </button>
              {expanded && (
                <p
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  className="px-5 pb-5 -mt-1 text-[15px] text-mute leading-relaxed animate-rise"
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
