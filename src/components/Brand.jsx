import React from 'react';
import { Gift } from 'lucide-react';

// Wishly wordmark — serif display type with a minimal monochrome mark.
export default function Brand({ size = 'md', onClick, showMark = true, className = '' }) {
  const dims = {
    sm: { box: 'w-7 h-7', icon: 'w-4 h-4', text: 'text-lg' },
    md: { box: 'w-9 h-9', icon: 'w-[18px] h-[18px]', text: 'text-xl' },
    lg: { box: 'w-11 h-11', icon: 'w-5 h-5', text: 'text-2xl' },
  }[size];

  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      onClick={onClick}
      className={`flex items-center gap-2.5 ${onClick ? 'group' : ''} ${className}`}
    >
      {showMark && (
        <span
          className={`${dims.box} rounded-xl bg-fg text-paper grid place-items-center shrink-0 ${
            onClick ? 'group-hover:opacity-90 transition' : ''
          }`}
        >
          <Gift className={dims.icon} strokeWidth={1.75} />
        </span>
      )}
      <span className={`${dims.text} font-serif font-medium tracking-tight text-fg leading-none`}>
        Wish<span className="text-gold">ly</span>
      </span>
    </Wrapper>
  );
}
