import React from 'react';

export default function PageHeader({ title, subtitle, icon: Icon, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="hidden sm:grid place-items-center w-11 h-11 rounded-2xl bg-brand-100 text-brand-600 shrink-0">
            <Icon className="w-6 h-6" />
          </span>
        )}
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-ink-500 text-sm mt-1 max-w-xl">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function Page({ children, className = '' }) {
  return (
    <div className={`max-w-5xl mx-auto px-4 py-6 sm:py-8 animate-fade-in ${className}`}>
      {children}
    </div>
  );
}
