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
    <div className="flex items-end justify-between gap-4 mb-8 animate-rise">
      <div>
        {eyebrow && <p className="eyebrow text-brand-ink mb-2">{eyebrow}</p>}
        <h1 className="heading text-[32px] sm:text-4xl text-fg">{title}</h1>
        {subtitle && <p className="text-mute text-base mt-3 max-w-xl leading-relaxed">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Page({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-12 animate-fade-in ${className}`}>
      {children}
    </div>
  );
}
