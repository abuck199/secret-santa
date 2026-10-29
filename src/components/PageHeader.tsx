import type { ReactNode } from 'react';

export default function PageHeader({
  title,
  subtitle,
  eyebrow,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  eyebrow?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8 animate-rise">
      <div>
        {eyebrow && <p className="eyebrow text-brand-ink mb-1.5">{eyebrow}</p>}
        <h1 className="heading text-[26px] sm:text-[30px] text-fg">{title}</h1>
        {subtitle && <p className="text-mute text-[15px] mt-2 max-w-xl leading-relaxed">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Page({
  children,
  wide = false,
  className = '',
}: {
  children: ReactNode;
  wide?: boolean; // dashboards with a two-column desktop layout
  className?: string;
}) {
  return (
    <div
      className={`${wide ? 'max-w-5xl' : 'max-w-3xl'} mx-auto px-4 sm:px-6 py-5 sm:py-10 animate-fade-in ${className}`}
    >
      {children}
    </div>
  );
}
