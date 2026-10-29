// The "gift wraps itself" moment when someone decides to give a present.
// Pure CSS animations (globals.css): they play once on mount, so render these
// only when the state changes, and they disappear under reduced motion.

import type { CSSProperties } from 'react';

// A wrapped present: box + lid in `box`, ribbon and bow in `ribbon`. With
// `animate`, the lid drops on, the ribbon ties itself and the bow pops.
export function WrappedGift({
  box = 'rgb(var(--brand))',
  ribbon = 'rgb(var(--sun))',
  animate = false,
  className = '',
}: {
  box?: string;
  ribbon?: string;
  animate?: boolean;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <rect x="9" y="24" width="30" height="18" rx="2.5" fill={box} className={animate ? 'gift-box' : ''} />
      <rect x="6" y="16" width="36" height="9" rx="2.5" fill={box} className={animate ? 'gift-lid' : ''} />
      <g className={animate ? 'gift-ribbon' : ''}>
        <rect x="21" y="16" width="6" height="26" fill={ribbon} />
        <rect x="6" y="19" width="36" height="3" fill={ribbon} opacity="0.55" />
      </g>
      <g className={animate ? 'gift-bow' : ''}>
        <path d="M24 16 C17 5, 7 8, 11 14 C13 17, 19 17, 24 16Z" fill={ribbon} />
        <path d="M24 16 C31 5, 41 8, 37 14 C35 17, 29 17, 24 16Z" fill={ribbon} />
        <circle cx="24" cy="15.5" r="3" fill={ribbon} />
      </g>
    </svg>
  );
}

// Pieces fly out from the centre of the (relative) parent.
const PIECES: { dx: number; dy: number; r: number; color: 'brand' | 'sun' | 'fg'; shape: 'dot' | 'square' | 'bar' }[] = [
  { dx: -150, dy: -110, r: 200, color: 'brand', shape: 'square' },
  { dx: -100, dy: -150, r: -160, color: 'sun', shape: 'dot' },
  { dx: -40, dy: -170, r: 260, color: 'fg', shape: 'bar' },
  { dx: 20, dy: -160, r: -220, color: 'brand', shape: 'square' },
  { dx: 80, dy: -140, r: 180, color: 'sun', shape: 'dot' },
  { dx: 140, dy: -100, r: -300, color: 'brand', shape: 'bar' },
  { dx: 160, dy: -40, r: 240, color: 'sun', shape: 'square' },
  { dx: -160, dy: -40, r: -140, color: 'sun', shape: 'dot' },
  { dx: -70, dy: -60, r: 300, color: 'brand', shape: 'bar' },
  { dx: 60, dy: -70, r: -200, color: 'fg', shape: 'dot' },
  { dx: 110, dy: -190, r: 120, color: 'brand', shape: 'dot' },
  { dx: -120, dy: -200, r: -120, color: 'sun', shape: 'bar' },
];

export function Confetti() {
  return (
    <span aria-hidden="true" className="absolute left-1/2 top-1/2 pointer-events-none">
      {PIECES.map((p, i) => (
        <span
          key={i}
          className="confetti"
          style={
            {
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`,
              '--r': `${p.r}deg`,
              background: `rgb(var(--${p.color}))`,
              borderRadius: p.shape === 'dot' ? '999px' : '2px',
              ...(p.shape === 'bar' ? { width: 6, height: 14 } : {}),
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}
