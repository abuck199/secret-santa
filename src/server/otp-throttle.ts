// Caps the emails we send on someone's request. Better Auth already limits
// each IP (3 code requests a minute); this stops anyone flooding one inbox
// from many IPs, or an admin re-announcing a draw over and over, from burning
// the Resend quota (100 emails/day on the free plan), which would lock
// everyone out of sign-in.

import 'server-only';
import { createHash } from 'node:crypto';
import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { rateLimits } from '@/db/schema';

export const OTP_EMAILS_PER_HOUR = 5;
const HOUR_MS = 60 * 60 * 1000;

// Counts one hit on `key` in a fixed window (`last_request` holds the window
// start) and returns the count so far.
async function hit(key: string, windowMs: number, now: number): Promise<number> {
  const expired = sql`${rateLimits.lastRequest} < ${now - windowMs}`;
  const [row] = await db
    .insert(rateLimits)
    .values({ key, count: 1, lastRequest: now })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`case when ${expired} then 1 else ${rateLimits.count} + 1 end`,
        lastRequest: sql`case when ${expired} then ${now} else ${rateLimits.lastRequest} end`,
      },
    })
    .returning({ count: rateLimits.count });
  return row.count;
}

// Counts this request and says whether a code may still be emailed. The key
// is a hash, so the table never holds the address itself.
export async function allowOtpEmail(email: string, now = Date.now()): Promise<boolean> {
  const key = `otp-email:${createHash('sha256').update(email.toLowerCase()).digest('hex')}`;
  return (await hit(key, HOUR_MS, now)) <= OTP_EMAILS_PER_HOUR;
}

// "Your draw is ready" goes to the whole household: a few rounds a day at most.
export const SANTA_ANNOUNCEMENTS_PER_DAY = 3;

export async function allowSantaEmails(householdId: string, now = Date.now()): Promise<boolean> {
  return (await hit(`santa-email:${householdId}`, 24 * HOUR_MS, now)) <= SANTA_ANNOUNCEMENTS_PER_DAY;
}
