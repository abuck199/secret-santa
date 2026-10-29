'use client';

import { useEffect, useRef, useState } from 'react';

// Animate a number from `from` to `target` with an ease-out curve (counts up
// from 0 by default; pass a higher `from` for a countdown). Respects
// prefers-reduced-motion by snapping straight to the value.
export function useCountUp(target: number, duration = 700, from = 0) {
  const [value, setValue] = useState(from);
  const raf = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const start = performance.now();
    const tick = (now: number) => {
      const t = reduce || target === from ? 1 : Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, from]);

  return value;
}
