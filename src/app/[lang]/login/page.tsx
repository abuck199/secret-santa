import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getLang, getT } from '@/i18n/server';
import { alternates } from '@/lib/seo';
import LoginForm from './login-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t('auth.signin'), alternates: alternates('/login', await getLang()) };
}

// Sign-in and sign-up are the same flow: email -> 6-digit code. New emails
// get an account on the spot, then the app asks for name and birthday.
export default function LoginPage() {
  return (
    // LoginForm reads ?next=, which needs a Suspense boundary on a static page.
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
