// Custom gift-with-a-spark mark, drawn directly (no background tile).
// The box uses currentColor (inherits the wrapper's text-fg); the ribbon +
// spark use the brand colour.
function GiftMark({ className }: { className?: string }) {
  const brand = { fill: 'rgb(var(--brand))' };
  return (
    <svg className={className} viewBox="134 110 244 294" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g transform="translate(0,10)">
        <path d="M256 104 L267 141 L304 152 L267 163 L256 200 L245 163 L208 152 L245 141 Z" style={brand} />
        <rect x="138" y="216" width="236" height="46" rx="12" fill="currentColor" />
        <rect x="154" y="262" width="204" height="128" rx="14" fill="currentColor" />
        <rect x="239" y="216" width="34" height="174" style={brand} />
      </g>
    </svg>
  );
}

const DIMS = {
  sm: { icon: 'h-7 w-7', text: 'text-lg' },
  md: { icon: 'h-8 w-8', text: 'text-xl' },
  lg: { icon: 'h-11 w-11', text: 'text-2xl' },
};

// ThatWish wordmark: display type with a minimal gift mark. Wrap it in a
// <Link> where it should navigate (the old `onClick` prop).
export default function Brand({
  size = 'md',
  showMark = true,
  className = '',
}: {
  size?: keyof typeof DIMS;
  showMark?: boolean;
  className?: string;
}) {
  const dims = DIMS[size];
  return (
    <span className={`flex items-center gap-2 text-fg ${className}`}>
      {showMark && <GiftMark className={`${dims.icon} shrink-0`} />}
      <span className={`${dims.text} font-display font-black uppercase tracking-tight leading-none`}>
        That<span className="text-brand-ink">Wish</span>
      </span>
    </span>
  );
}
