'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

// A scannable code for an invite link: handy at a family gathering, where
// people point their phone camera at the admin's screen instead of typing.
// Drawn as inline SVG (the CSP allows no image hosts beyond our own).
export default function InviteQr({ url, label }: { url: string; label: string }) {
  const [svg, setSvg] = useState('');
  const box = useRef<HTMLDivElement>(null);

  // Once drawn, bring the whole code on screen (it opens near the bottom, under the tab bar).
  useEffect(() => {
    if (svg) box.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [svg]);

  useEffect(() => {
    let alive = true;
    QRCode.toString(url, {
      type: 'svg',
      margin: 1,
      errorCorrectionLevel: 'M',
      // Dark on white: scanners need the contrast, brand colours read worse.
      color: { dark: '#1A1A1A', light: '#FFFFFF' },
    }).then((s) => alive && setSvg(s));
    return () => {
      alive = false;
    };
  }, [url]);

  return (
    <div
      ref={box}
      role="img"
      aria-label={label}
      className="w-56 h-56 max-w-full p-3 rounded-3xl bg-white shadow-soft [&>svg]:w-full [&>svg]:h-full animate-pop"
      // The SVG comes from the qrcode library, built from our own invite URL.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
