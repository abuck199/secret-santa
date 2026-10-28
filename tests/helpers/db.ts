// In-memory Postgres for tests, migrated with the same SQL as production.
// Replaces `@/db` (see tests/setup.ts).

import { PGlite } from '@electric-sql/pglite';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import * as schema from '@/db/schema';

const client = new PGlite();
export const db = drizzle(client, { schema });
await migrate(db, { migrationsFolder: 'drizzle' });

export async function resetDb() {
  await db.execute(sql`
    truncate table "user", households, rate_limit, verification restart identity cascade
  `);
}
