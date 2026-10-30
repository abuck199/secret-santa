'use client';

import { useState } from 'react';

// Split-flap digits, like an old airport board: when a digit changes, the old
// top half folds down and the new bottom half lands over the old one.
// Purely visual: the parent carries the accessible label.
export default function FlapCounter({ value, digits }: { value: number; digits: number }) {
  const chars = String(value).padStart(digits, ' ').split('');
  return (
    <span aria-hidden="true" className="inline-flex gap-[3px]">
      {chars.map((c, i) => (
        <FlapDigit key={i} char={c} />
      ))}
    </span>
  );
}

function FlapDigit({ char }: { char: string }) {
  // Derived state: remember the previous digit to fold it away (n restarts the animation).
  const [flap, setFlap] = useState({ cur: char, prev: char, n: 0 });
  if (flap.cur !== char) setFlap({ cur: char, prev: flap.cur, n: flap.n + 1 });

  return (
    <span className="flap">
      <Half top>{flap.cur}</Half>
      <Half>{flap.prev}</Half>
      {flap.n > 0 && (
        <>
          <Half top key={`fold-${flap.n}`} className="flap-fold">
            {flap.prev}
          </Half>
          <Half key={`land-${flap.n}`} className="flap-land">
            {flap.cur}
          </Half>
        </>
      )}
    </span>
  );
}

function Half({ top = false, className = '', children }: { top?: boolean; className?: string; children: string }) {
  return (
    <span className={`flap-half ${top ? 'flap-top' : 'flap-bottom'} ${className}`}>
      <span className="flap-char">{children}</span>
    </span>
  );
}
