import type { ReactNode } from 'react';
import Link from 'next/link';
import Brand from './Brand';

// Shared look for the 404 and error pages: brand, a big code, a message and
// actions, centered on the page (no app chrome, which may be what broke).
export default function ErrorScreen({
  code,
  title,
  text,
  homeLabel,
  children,
}: {
  code: string;
  title: string;
  text: string;
  homeLabel: string;
  children?: ReactNode;
}) {
  return (
    <main id="main-content" className="min-h-screen bg-paper grid place-items-center px-4 py-12">
      <div className="w-full max-w-sm text-center animate-fade-in">
        <Link href="/" className="inline-block mb-10">
          <Brand size="md" />
        </Link>
        <p className="font-serif text-6xl font-medium text-gold tracking-tightest">{code}</p>
        <h1 className="font-serif text-2xl font-medium text-fg mt-4">{title}</h1>
        <p className="text-sm text-mute mt-2 leading-relaxed">{text}</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center mt-8">
          {children}
          <Link href="/" className="btn-secondary">{homeLabel}</Link>
        </div>
      </div>
    </main>
  );
}
