'use client';

import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type RefObject } from 'react';
import { Eye, Lock } from 'lucide-react';
import { Confetti } from '@/components/Celebration';
import WishCards from '@/components/WishCards';
import { useI18n } from '@/i18n/client';
import type { HouseholdItem } from '@/server/queries/wishlist';

// The draw as a card to turn over: the name stays hidden until asked (someone
// might be looking over your shoulder), and a button hides it again.
export default function DrawReveal({ receiverName, items }: { receiverName: string; items: HouseholdItem[] }) {
  const { t } = useI18n();
  const [revealed, setRevealed] = useState(false);
  const [flippedOnce, setFlippedOnce] = useState(false);

  // Cache Components keeps this page mounted (hidden) after leaving it:
  // come back to a face-down card.
  useLayoutEffect(() => () => setRevealed(false), []);

  function flip() {
    setRevealed(true);
    setFlippedOnce(true);
  }

  const holoRef = useRef<HTMLDivElement>(null);
  useHoloTilt(holoRef);

  return (
    <div className="animate-rise [animation-delay:100ms]">
      <div className="relative mx-auto max-w-sm h-[300px] [perspective:1200px]">
        {/* Tilts towards the pointer (or with the phone); tapping the card turns it over too. */}
        <div
          ref={holoRef}
          className="holo relative w-full h-full"
          onPointerMove={onHoloPointerMove}
          onPointerLeave={onHoloPointerLeave}
          onClick={revealed ? undefined : flip}
        >
          <div
            className="relative w-full h-full transition-transform duration-700 [transition-timing-function:cubic-bezier(0.3,1.3,0.5,1)] [transform-style:preserve-3d]"
            style={{ transform: revealed ? 'rotateY(180deg)' : 'none' }}
          >
            {/* Face down */}
            <div
              className={`absolute inset-0 rounded-3xl bg-brand text-white overflow-hidden [backface-visibility:hidden] flex flex-col items-center justify-center gap-4 p-6 ${
                revealed ? '' : 'cursor-pointer'
              }`}
              aria-hidden={revealed}
            >
              <span aria-hidden="true" className="absolute left-6 top-6 w-6 h-6 rounded-full bg-sun animate-float" />
              <span aria-hidden="true" className="absolute right-8 top-10 w-3.5 h-3.5 rounded-[3px] bg-white/80 rotate-12 animate-float [animation-delay:500ms]" />
              <span aria-hidden="true" className="absolute right-10 bottom-8 w-5 h-5 rounded-full border-[3px] border-brand-soft" />
              <span aria-hidden="true" className="holo-foil" />
              <span aria-hidden="true" className="holo-glare" />
              <span
                aria-hidden="true"
                className="relative w-24 h-24 rounded-[28px] bg-white text-brand-ink grid place-items-center heading text-[64px] animate-[wiggle_2.4s_ease-in-out_1s_infinite]"
              >
                ?
              </span>
              <p className="relative heading text-2xl text-center">{t('dash.santaReady')}</p>
            </div>

            {/* Face up */}
            <div
              className="absolute inset-0 rounded-3xl bg-sun text-fg overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col items-center justify-center gap-2 p-6 text-center"
              aria-hidden={!revealed}
            >
              <span aria-hidden="true" className="holo-foil" />
              <span aria-hidden="true" className="holo-glare" />
              {revealed && <span aria-hidden="true" className="holo-scan" />}
              <p className="relative eyebrow">{t('assign.subtitle')}</p>
              <span
                aria-hidden="true"
                className="relative w-20 h-20 my-1 rounded-full bg-brand text-white grid place-items-center font-display font-black text-4xl"
              >
                {(receiverName[0] || '?').toUpperCase()}
              </span>
              <p className="relative heading text-[40px] break-words max-w-full">
                <DecodeText text={receiverName} play={revealed} />
              </p>
            </div>
          </div>
        </div>
        {revealed && flippedOnce && <Confetti />}
      </div>

      {/* Announce the result for screen readers (the faces are visual). */}
      <p className="sr-only" aria-live="polite">
        {revealed ? `${t('assign.subtitle')} ${receiverName}` : ''}
      </p>

      <div className="max-w-sm mx-auto mt-5">
        {revealed ? (
          <button className="btn-secondary w-full animate-rise" onClick={() => setRevealed(false)}>
            {t('assign.hide')}
          </button>
        ) : (
          <>
            <p className="flex items-center justify-center gap-2 text-[15px] text-fg mb-3">
              <Eye className="w-5 h-5 shrink-0" aria-hidden="true" /> {t('assign.privacy')}
            </p>
            <button className="btn-primary w-full" onClick={flip}>
              {t('assign.flip')}
            </button>
          </>
        )}
        <p className="flex items-start gap-2 mt-4 text-sm text-mute">
          <Lock className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" /> {t('assign.secret')}
        </p>
      </div>

      {revealed && (
        <section className="mt-8 animate-rise [animation-delay:500ms]">
          <h2 className="heading text-lg text-fg mb-3">{t('assign.theirList')}</h2>
          {items.length === 0 ? (
            <div className="card p-6 text-center text-[15px] text-mute">
              {t('member.empty', { name: receiverName })}
            </div>
          ) : (
            <WishCards items={items} ownerName={receiverName} />
          )}
        </section>
      )}
    </div>
  );
}

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

// Where the light comes from on the holographic card (CSS --mx/--my): the
// pointer, else the phone's tilt where the browser gives it without asking
// (Android; iOS would pop a permission prompt, not worth it), else the slow
// CSS drift. Nothing follows anything with reduced motion.
function aim(el: HTMLElement, x: number, y: number) {
  el.dataset.live = '';
  el.style.setProperty('--mx', clamp01(x).toFixed(3));
  el.style.setProperty('--my', clamp01(y).toFixed(3));
}

function onHoloPointerMove(e: PointerEvent<HTMLDivElement>) {
  if (reducedMotion()) return;
  const r = e.currentTarget.getBoundingClientRect();
  aim(e.currentTarget, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
}

function onHoloPointerLeave(e: PointerEvent<HTMLDivElement>) {
  if (e.currentTarget.dataset.live !== undefined) aim(e.currentTarget, 0.5, 0.5);
}

function useHoloTilt(ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (reducedMotion() || typeof DeviceOrientationEvent === 'undefined') return;
    if (typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission === 'function') return;
    let frame = 0;
    const onTilt = (e: DeviceOrientationEvent) => {
      const { gamma, beta } = e;
      if (gamma == null || beta == null) return;
      cancelAnimationFrame(frame);
      // Held upright-ish (beta ≈ 45°) is the centre.
      frame = requestAnimationFrame(() => ref.current && aim(ref.current, 0.5 + gamma / 50, 0.5 + (beta - 45) / 50));
    };
    window.addEventListener('deviceorientation', onTilt);
    return () => {
      window.removeEventListener('deviceorientation', onTilt);
      cancelAnimationFrame(frame);
    };
  }, [ref]);
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#*+';

// The name settles letter by letter out of scrambled characters, like a code
// being cracked. The real name sits underneath, invisible, to hold the layout.
function DecodeText({ text, play }: { text: string; play: boolean }) {
  const [shown, setShown] = useState(text);

  useEffect(() => {
    if (!play || reducedMotion()) return;
    const chars = [...text];
    const start = performance.now() + 350; // once the card is half turned
    const step = Math.max(60, 1000 / chars.length); // about a second, longer for long names
    let frame = 0;
    let last = 0;
    const tick = (now: number) => {
      if (now - last > 45) {
        last = now;
        const settled = Math.floor((now - start) / step);
        setShown(
          chars
            .map((c, i) => (i < settled || !c.trim() ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
            .join(''),
        );
        if (settled >= chars.length) return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      setShown(text);
    };
  }, [text, play]);

  return (
    <span className="relative inline-block">
      <span className="invisible">{text}</span>
      <span aria-hidden="true" className="absolute inset-0">
        {shown}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
