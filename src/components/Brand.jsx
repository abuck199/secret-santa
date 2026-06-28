import React from 'react';
import { Gift } from 'lucide-react';

// Wishly wordmark + icon. `size` controls the icon badge; text scales with it.
export default function Brand({ size = 'md', onClick, className = '' }) {
  const dims = {
    sm: { box: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-lg' },
    md: { box: 'w-10 h-10', icon: 'w-5 h-5', text: 'text-xl' },
    lg: { box: 'w-14 h-14', icon: 'w-7 h-7', text: 'text-3xl' },
  }[size];

  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      onClick={onClick}
      className={`flex items-center gap-2.5 ${onClick ? 'group' : ''} ${className}`}
    >
      <span
        className={`${dims.box} rounded-2xl bg-brand-gradient text-white grid place-items-center shadow-glow ${
          onClick ? 'group-hover:scale-105 transition' : ''
        }`}
      >
        <Gift className={dims.icon} />
      </span>
      <span
        className={`${dims.text} font-extrabold tracking-tight text-ink-900`}
      >
        Wish<span className="text-brand-600">ly</span>
      </span>
    </Wrapper>
  );
}
