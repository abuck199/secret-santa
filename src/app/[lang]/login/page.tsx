import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getLang, getT } from '@/i18n/server';
import { publicMetadata } from '@/lib/seo';
import LoginForm from './login-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return publicMetadata(t, await getLang(), '/login', { title: t('auth.signin'), description: t('seo.loginDesc') });
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
