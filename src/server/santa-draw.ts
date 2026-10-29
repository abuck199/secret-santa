// The Secret Santa pairing itself, kept out of the 'use server' file so it can
// be tested directly (and isn't a public endpoint).

import 'server-only';
import { randomInt } from 'node:crypto';

const ATTEMPTS = 5000;

// Unbiased Fisher-Yates with a CSPRNG: nobody should be able to predict the
// draw from Math.random's state.
function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

// One big loop (each person gives to the next): nobody draws themselves, and
// no excluded pair (partners…) is next to each other in either direction.
// Random restarts until one fits; null when the exclusions leave no way
// (e.g. 3 people with any one pair excluded), so the admin can be told.
export function drawCycle(userIds: string[], excluded: Set<string>): [giver: string, receiver: string][] | null {
  if (userIds.length < 2) return null;
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    const order = shuffle(userIds);
    const pairs = order.map((giver, i) => [giver, order[(i + 1) % order.length]] as [string, string]);
    if (pairs.every(([g, r]) => !excluded.has(pairKey(g, r)))) return pairs;
  }
  return null;
}
