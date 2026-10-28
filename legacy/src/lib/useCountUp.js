import { useEffect, useRef, useState } from 'react';

// Animate a number from 0 up to `target` with an ease-out curve. Respects
// prefers-reduced-motion by snapping straight to the value.
export function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !target) {
      setValue(target || 0);
      return;
    }

    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(Math.round(target * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return value;
}

export default useCountUp;
