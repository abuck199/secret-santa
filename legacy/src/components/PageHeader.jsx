import React from 'react';

export default function PageHeader({ title, subtitle, eyebrow, action }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-8">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold mb-2">
            {eyebrow}
          </p>
        )}
        <h1 className="font-serif text-[22px] sm:text-2xl font-medium tracking-tight text-fg leading-tight">
          {title}
        </h1>
        {subtitle && <p className="text-mute text-sm mt-2 max-w-xl leading-relaxed">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Page({ children, className = '' }) {
  return (
    <div className={`max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-in ${className}`}>
      {children}
    </div>
  );
}
