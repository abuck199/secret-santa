// Caps sign-in codes per email address. Better Auth already limits each IP
// (3 code requests a minute); this stops anyone flooding one inbox from many
// IPs or burning the Resend quota (100 emails/day on the free plan), which
// would lock everyone out.

import 'server-only';
import { createHash } from 'node:crypto';
import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { rateLimits } from '@/db/schema';

export const OTP_EMAILS_PER_HOUR = 5;
const HOUR_MS = 60 * 60 * 1000;

// Counts this request and says whether a code may still be emailed. The key
// is a hash, so the table never holds the address itself.
export async function allowOtpEmail(email: string, now = Date.now()): Promise<boolean> {
  const key = `otp-email:${createHash('sha256').update(email.toLowerCase()).digest('hex')}`;
  // Fixed one-hour window: `last_request` holds the window start.
  const expired = sql`${rateLimits.lastRequest} < ${now - HOUR_MS}`;
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
  return row.count <= OTP_EMAILS_PER_HOUR;
}
