import React from 'react';

// Custom gift-with-a-spark mark, drawn directly (no background tile).
// The box uses currentColor (inherits the wrapper's text-fg, so it adapts to
// light/dark); the ribbon + spark use the gold token.
function GiftMark({ className }) {
  const gold = { fill: 'rgb(var(--gold))' };
  return (
    <svg className={className} viewBox="134 110 244 294" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g transform="translate(0,10)">
        <path d="M256 104 L267 141 L304 152 L267 163 L256 200 L245 163 L208 152 L245 141 Z" style={gold} />
        <rect x="138" y="216" width="236" height="46" rx="12" fill="currentColor" />
        <rect x="154" y="262" width="204" height="128" rx="14" fill="currentColor" />
        <rect x="239" y="216" width="34" height="174" style={gold} />
      </g>
    </svg>
  );
}

// ThatWish wordmark: serif display type with a minimal gift mark.
export default function Brand({ size = 'md', onClick, showMark = true, className = '' }) {
  const dims = {
    sm: { icon: 'h-7 w-7', text: 'text-lg' },
    md: { icon: 'h-8 w-8', text: 'text-xl' },
    lg: { icon: 'h-11 w-11', text: 'text-2xl' },
  }[size];

  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      onClick={onClick}
      className={`flex items-center gap-2 text-fg ${onClick ? 'group' : ''} ${className}`}
    >
      {showMark && (
        <GiftMark
          className={`${dims.icon} shrink-0 ${onClick ? 'group-hover:opacity-80 transition' : ''}`}
        />
      )}
      <span className={`${dims.text} font-serif font-medium tracking-tight leading-none`}>
        That<span className="text-gold">Wish</span>
      </span>
    </Wrapper>
  );
}
