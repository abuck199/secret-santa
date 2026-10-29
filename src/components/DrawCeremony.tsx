'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { Gift } from 'lucide-react';
import { useI18n } from '@/i18n/client';
import { Confetti } from './Celebration';

const MAX_CARDS = 8;
const SHUFFLE_MS = 1400;
const FLIP_MS = 600;
const FLIP_STAGGER_MS = 90;

// Shown to the admin right after a successful Secret Santa draw: everyone's
// card shuffles, then turns face down, then confetti. It never shows who drew
// whom (nobody, admins included, may see the pairings): only the names.
export default function DrawCeremony({ names, onClose }: { names: string[]; onClose: () => void }) {
  const { t } = useI18n();
  const shown = names.slice(0, MAX_CARDS);
  const extra = names.length - shown.length;
  const perRow = shown.length <= 4 ? shown.length : shown.length <= 6 ? 3 : 4;
  // Reduced motion: straight to the result. (Only ever mounted after a click,
  // so the browser's matchMedia is there.)
  const [phase, setPhase] = useState<'shuffle' | 'flip' | 'done'>(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'done' : 'shuffle',
  );
  const animating = phase === 'shuffle';

  useEffect(() => {
    if (!animating) return;
    const toFlip = setTimeout(() => setPhase('flip'), SHUFFLE_MS);
    const toDone = setTimeout(() => setPhase('done'), SHUFFLE_MS + FLIP_MS + shown.length * FLIP_STAGGER_MS);
    return () => {
      clearTimeout(toFlip);
      clearTimeout(toDone);
    };
    // Timers start once, from the first (shuffle) phase.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const flipped = phase !== 'shuffle';

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center px-4 bg-fg/60 animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="draw-title"
        className="relative w-full max-w-md rounded-[28px] bg-brand text-white p-6 sm:p-7 shadow-card animate-pop"
      >
        <p className="eyebrow">Secret Santa</p>
        <h2 id="draw-title" className="heading text-2xl mt-1.5">
          {phase === 'done' ? t('draw.doneTitle') : t('draw.running')}
        </h2>

        {/* Rows balanced for the count (5 → 3 + 2, centred), never one card alone. */}
        <ul className="flex flex-wrap justify-center gap-2.5 mt-5 [perspective:900px]" aria-hidden="true">
          {shown.map((name, i) => (
            // Outer element shuffles around, inner one flips: two transforms, two elements.
            <li
              key={`${name}-${i}`}
              className={phase === 'shuffle' ? 'animate-[shuffle_1.4s_ease-in-out_both]' : ''}
              style={
                {
                  width: `min(96px, calc((100% - ${(perRow - 1) * 10}px) / ${perRow}))`,
                  '--sx': `${(i % 2 ? -1 : 1) * (18 + (i * 7) % 22)}px`,
                  '--sy': `${(i % 3 ? 1 : -1) * (10 + (i * 5) % 16)}px`,
                  '--sr': `${(i % 2 ? 1 : -1) * (6 + (i * 3) % 9)}deg`,
                } as CSSProperties
              }
            >
              <div
                className="relative aspect-[3/4] [transform-style:preserve-3d] transition-transform"
                style={{
                  transform: flipped ? 'rotateY(180deg)' : 'none',
                  transitionDuration: `${FLIP_MS}ms`,
                  transitionDelay: `${i * FLIP_STAGGER_MS}ms`,
                }}
              >
                <span className="absolute inset-0 rounded-2xl bg-white text-fg flex flex-col items-center justify-center gap-1 p-1 [backface-visibility:hidden]">
                  <span className="w-8 h-8 rounded-full bg-brand text-white grid place-items-center font-display font-black text-sm">
                    {(name[0] || '?').toUpperCase()}
                  </span>
                  <span className="text-[11px] font-semibold truncate max-w-full">{name}</span>
                </span>
                <span className="absolute inset-0 rounded-2xl bg-sun text-fg grid place-items-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <Gift className="w-6 h-6" strokeWidth={2.2} />
                </span>
              </div>
            </li>
          ))}
        </ul>
        {extra > 0 && <p className="mt-2 text-sm font-semibold text-center">+{extra}</p>}

        <div className="mt-5 min-h-[92px]" aria-live="polite">
          {phase === 'done' && (
            <div className="animate-rise">
              <p className="text-base">{t('draw.doneText', { count: names.length })}</p>
              <button
                onClick={onClose}
                className="press mt-4 inline-flex items-center justify-center min-h-11 px-6 rounded-full bg-white text-brand-ink text-[15px] font-semibold"
                autoFocus
              >
                {t('draw.close')}
              </button>
            </div>
          )}
        </div>
        {phase === 'done' && <Confetti />}
      </div>
    </div>
  );
}
