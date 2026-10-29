'use client';

import { useState, type ReactNode } from 'react';

// A wish's product photo, hotlinked from the shop. Falls back to `fallback`
// (the gift icon) when there is none or it fails to load (shops move or block
// images). No referrer: some shop CDNs refuse hotlinks that carry one.
export default function ProductImage({
  src,
  fallback,
  className = '',
}: {
  src: string | null | undefined;
  fallback: ReactNode;
  className?: string;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!src || failed === src) return <>{fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- any shop's host, no optimizer needed for thumbnails
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(src)}
      className={`w-full h-full object-cover ${className}`}
    />
  );
}
