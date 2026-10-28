// Better Auth, self-hosted in this app: email OTP only (no passwords, no
// OAuth). Its tables live in our own Neon DB next to the domain tables.

import 'server-only';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { emailOTP } from 'better-auth/plugins';
import { after } from 'next/server';
import { db } from '@/db';
import { users, sessions, accounts, verifications, profiles } from '@/db/schema';
import { LANG_COOKIE, isLocale } from '@/i18n/config';
import { sendOtpEmail, type EmailLang } from '@/lib/email';

// The language picked with the toggle (cookie), else the browser's, using the
// same rule as the proxy: French unless the browser is set to English.
function langFrom(request?: Request): EmailLang {
  const cookie = request?.headers.get('cookie')?.match(new RegExp(`(?:^|; )${LANG_COOKIE}=(\\w+)`))?.[1];
  if (isLocale(cookie)) return cookie;
  const header = request?.headers.get('accept-language');
  if (!header) return 'en';
  return header.toLowerCase().startsWith('en') ? 'en' : 'fr';
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user: users, session: sessions, account: accounts, verification: verifications },
  }),
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
    emailOTP({
      storeOTP: 'hashed',
      // Sent after the response so the endpoint answers in constant time,
      // whether or not the address has an account.
      async sendVerificationOTP({ email, otp }, ctx) {
        const lang = langFrom(ctx?.request);
        after(() =>
          sendOtpEmail(email, otp, lang).catch((err) => console.error('OTP email failed:', err)),
        );
      },
    }),
    nextCookies(), // must stay last
  ],
});
