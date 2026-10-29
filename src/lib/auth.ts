// Better Auth, self-hosted in this app: email OTP only (no passwords, no
// OAuth). Its tables live in our own Neon DB next to the domain tables.

import 'server-only';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { captcha, emailOTP } from 'better-auth/plugins';
import { after } from 'next/server';
import { db } from '@/db';
import { users, sessions, accounts, verifications, profiles, rateLimits } from '@/db/schema';
import { LANG_COOKIE, isLocale, localeFromAcceptLanguage } from '@/i18n/config';
import { DELETION_OTP_TYPE, sendOtpEmail, type EmailLang } from '@/lib/email';
import { allowOtpEmail } from '@/server/otp-throttle';

// Same rule as the proxy: the language picked with the toggle (cookie), else
// the browser's. Headers come from the HTTP request, or from the caller when a
// Server Action calls auth.api directly.
function langFrom(h?: Headers): EmailLang {
  const cookie = h?.get('cookie')?.match(new RegExp(`(?:^|; )${LANG_COOKIE}=(\\w+)`))?.[1];
  if (isLocale(cookie)) return cookie;
  return localeFromAcceptLanguage(h?.get('accept-language'));
}

// Cloudflare's official test secret (always passes). Only for local dev and
// tests: next.config.ts fails Vercel builds that lack the real keys.
const TURNSTILE_TEST_SECRET = '1x0000000000000000000000000000000AA';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
      rateLimit: rateLimits,
    },
  }),
  // In the DB so every server instance shares the counters (on by default in
  // production only).
  rateLimit: { storage: 'database' },
  // UUIDs so every FK in the domain tables stays a plain `uuid` column.
  advanced: { database: { generateId: 'uuid' } },
  databaseHooks: {
    user: {
      create: {
        // Replaces the old `handle_new_user` trigger.
        after: async (user) => {
          await db.insert(profiles).values({ id: user.id }).onConflictDoNothing();
        },
      },
    },
  },
  plugins: [
    // Bot check (Cloudflare Turnstile) before a sign-in code is emailed: keeps
    // scripts from creating accounts or burning the email quota. The browser
    // sends the widget's token in the `x-captcha-response` header.
    captcha({
      provider: 'cloudflare-turnstile',
      secretKey: process.env.TURNSTILE_SECRET_KEY || TURNSTILE_TEST_SECRET,
      endpoints: ['/email-otp/send-verification-otp'],
    }),
    emailOTP({
      storeOTP: 'hashed',
      // Sent after the response so the endpoint answers in constant time,
      // whether or not the address has an account (or hit the cap: the
      // response never says, so the cap can't be used to probe addresses).
      async sendVerificationOTP({ email, otp, type }, ctx) {
        const lang = langFrom(ctx?.request?.headers ?? ctx?.headers);
        const purpose = type === DELETION_OTP_TYPE ? 'delete-account' : 'sign-in';
        after(async () => {
          try {
            if (!(await allowOtpEmail(email))) {
              console.warn('OTP email skipped: hourly cap reached for one address');
              return;
            }
            await sendOtpEmail(email, otp, lang, purpose);
          } catch (err) {
            console.error('OTP email failed:', err);
          }
        });
      },
    }),
    nextCookies(), // must stay last
  ],
});
