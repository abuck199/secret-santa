'use client';

import { useSyncExternalStore } from 'react';
import { useI18n } from '@/i18n/client';

// Popular first names in Québec, for the landing page's sample card.
const NAMES = [
  'Léa', 'Emma', 'Florence', 'Charlotte', 'Alice', 'Olivia', 'Zoé', 'Rosalie', 'Juliette', 'Béatrice',
  'Livia', 'Clara', 'William', 'Thomas', 'Liam', 'Noah', 'Jacob', 'Félix', 'Léo', 'Nathan',
  'Édouard', 'Gabriel', 'Mathis', 'Raphaël', 'Samuel', 'Arthur', 'Émile', 'Charles',
];

type Sample = { name: string; days: number; age: number; month: number; day: number };

const pick = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

// Drawn once per page load, in the browser: the page is prerendered at build
// time (where reading today's date is not allowed), so the server and
// crawlers get a fixed sample. One cached object, as useSyncExternalStore needs.
let drawn: Sample | null = null;
function browserSample(): Sample {
  if (!drawn) {
    const days = pick(1, 45);
    const date = new Date();
    date.setDate(date.getDate() + days);
    drawn = {
      name: NAMES[pick(0, NAMES.length - 1)],
      days,
      age: pick(6, 78),
      month: date.getMonth(),
      day: date.getDate(),
    };
  }
  return drawn;
}
const SERVER_SAMPLE: Sample = { name: NAMES[0], days: 3, age: 32, month: 5, day: 30 };
const serverSample = () => SERVER_SAMPLE;
const noSubscribe = () => () => {};

// The raspberry "next birthday" card of the landing page's app preview.
export default function MockBirthday() {
  const { t, lang } = useI18n();
  const { name, days, age, month, day } = useSyncExternalStore(noSubscribe, browserSample, serverSample);
  const dateLabel = new Intl.DateTimeFormat(lang === 'fr' ? 'fr-CA' : 'en-US', { month: 'long', day: 'numeric' }).format(
    new Date(2000, month, day),
  );

  return (
    <div className="relative overflow-hidden rounded-3xl bg-brand text-white p-5">
      <span className="absolute right-5 top-4 w-5 h-5 rounded-full bg-sun animate-float" />
      <span className="absolute right-14 top-10 w-2.5 h-2.5 rounded-[3px] bg-white/80 rotate-12 animate-float [animation-delay:600ms]" />
      <p className="eyebrow">{t('landing.mock.next')}</p>
      <div className="flex items-center gap-4 mt-3">
        <div className="w-[68px] h-[68px] shrink-0 rounded-2xl bg-white text-brand-ink grid place-items-center text-center">
          <div>
            <p className="heading text-[28px] tabular-nums">{days}</p>
            <p className="font-mono text-[11px] font-semibold uppercase mt-0.5">
              {days === 1 ? t('dash.dayUnit') : t('dash.daysUnit')}
            </p>
          </div>
        </div>
        <div className="min-w-0">
          <p className="heading text-[26px]">{name}</p>
          <p className="text-[15px] mt-1">
            {dateLabel} · {t('dash.turning', { age })}
          </p>
        </div>
      </div>
    </div>
  );
}
