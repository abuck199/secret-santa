// One-off: adopt versioned migrations on a database that was built with
// `drizzle-kit push`. Records drizzle/0000_* as already applied (same table
// and hash Drizzle's migrator uses), so `pnpm db:migrate` starts from 0001.
// Refuses on an empty database (just run `pnpm db:migrate` there) and on one
// that already tracks migrations. DATABASE_URL from the env or .env.local.

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import nextEnv from '@next/env';
import postgres from 'postgres';

nextEnv.loadEnvConfig(process.cwd());
const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');

const journal = JSON.parse(readFileSync('drizzle/meta/_journal.json', 'utf8'));
const baseline = journal.entries[0];
const hash = createHash('sha256').update(readFileSync(`drizzle/${baseline.tag}.sql`, 'utf8')).digest('hex');

const sql = postgres(url, { max: 1, onnotice: () => {} });
try {
  const host = new URL(url).host;
  const [{ built }] = await sql`select to_regclass('public.wishlist_items') is not null as built`;
  if (!built) {
    console.log(`${host}: no tables yet. Run \`pnpm db:migrate\` instead.`);
    process.exit(1);
  }
  await sql`create schema if not exists drizzle`;
  await sql`create table if not exists drizzle.__drizzle_migrations (
    id serial primary key, hash text not null, created_at bigint)`;
  const [{ n }] = await sql`select count(*)::int as n from drizzle.__drizzle_migrations`;
  if (n > 0) {
    console.log(`${host}: already tracks ${n} migration(s); nothing to do.`);
  } else {
    await sql`insert into drizzle.__drizzle_migrations (hash, created_at) values (${hash}, ${baseline.when})`;
    console.log(`${host}: marked ${baseline.tag} as applied.`);
  }
} finally {
  await sql.end();
}
