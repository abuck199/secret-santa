// Server-only Drizzle client. Importing this from a client component fails the
// build, which keeps DATABASE_URL and raw rows out of the browser.

import 'server-only';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set (see .env.sample)');

// Reuse one connection pool across hot reloads in dev, otherwise every edit
// opens a new pool and Neon runs out of connections.
const globalForDb = globalThis as unknown as { pgClient?: postgres.Sql };
// On Vercel we connect through Neon's pooler (PgBouncer, transaction mode,
// `-pooler` in the host): skip named prepared statements there to be safe.
const client = globalForDb.pgClient ?? postgres(url, { prepare: !url.includes('-pooler') });
if (process.env.NODE_ENV !== 'production') globalForDb.pgClient = client;

export const db = drizzle(client, { schema });
