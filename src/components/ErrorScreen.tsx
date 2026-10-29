import type { ReactNode } from 'react';
import Link from 'next/link';
import Brand from './Brand';
import { WrappedGift } from './Celebration';

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
      <div className="w-full max-w-sm text-center">
        <Link href="/" className="inline-block mb-8 animate-rise">
          <Brand size="md" />
        </Link>
        {/* A grey, already-wrapped gift: "nothing for you here". */}
        <WrappedGift
          box="rgb(var(--mute) / 0.35)"
          ribbon="rgb(var(--mute))"
          className="w-20 h-20 mx-auto animate-[wiggle_2.4s_ease-in-out_0.8s_infinite]"
        />
        <p className="heading text-6xl text-brand mt-4 animate-rise [animation-delay:80ms]">{code}</p>
        <h1 className="heading text-2xl text-fg mt-3 animate-rise [animation-delay:140ms]">{title}</h1>
        <p className="text-[15px] text-mute mt-3 leading-relaxed animate-rise [animation-delay:200ms]">{text}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8 animate-rise [animation-delay:260ms]">
          {children}
          <Link href="/" className="btn-primary">{homeLabel}</Link>
        </div>
      </div>
    </main>
  );
}
