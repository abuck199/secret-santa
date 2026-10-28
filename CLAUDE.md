# CLAUDE.md — ThatWish
 
Project context for Claude Code. ThatWish is a shared-wishlist web app (family/group
wishlists for birthdays and Secret Santa, with quiet gift reservations so there are no
duplicates and no spoilers). This file is the source of truth for an in-progress rebuild.
 
## What we are doing
 
Rebuilding the app from its current stack onto a modern, self-owned, zero-cost stack.
The rebuild happens in this repo on the `next-rebuild` branch: the framework and data model
change, but the UI components, Tailwind styles, and i18n translations are ported from the old app.
The old app lives in `legacy/` (excluded from tsconfig and ESLint) as a porting reference;
delete `legacy/` once everything is ported. `public/` is shared by both.
 
- **Old (reference only, `legacy/` here, or `main`):** React + Vite 5 SPA,
  react-router, `@supabase/supabase-js` called from the browser, Supabase Auth
  (email + password), Postgres with RLS + `SECURITY DEFINER` RPCs. Hosted on Vercel.
- **New (this project):** Next.js 16 (App Router) + TypeScript + Tailwind 4, Drizzle ORM,
  Better Auth (email OTP), Postgres on Neon, Resend for email. DB access is server-side only.
## Key decisions (settled)
 
- **Database: Neon** (free serverless Postgres, scales to zero, wakes on query). Chosen over
  staying on Supabase because Supabase's free tier pauses the whole project after 7 days idle,
  which breaks a low-traffic app like this. Portable: a `pg_dump` moves it anywhere.
- **Auth: Better Auth with the email-OTP plugin** (enter email → receive a code → paste it).
  No passwords. Replaces Supabase Auth. The old app's Google sign-in is **dropped**, so
  `ResetPasswordView` and the Google-only parts of `CompleteProfileView`/`PrivacyView` are not
  ported (birthday is still collected at signup/onboarding).
- **Email: Resend** (free tier: 3,000/month, 100/day — ample here).
- **IDs: UUID.** Better Auth is configured to generate UUIDs so existing `uuid` FK columns
  stay unchanged.
- **Authorization moves to the app layer.** On Neon we connect with a single DB role, so
  Supabase RLS + `auth.uid()` no longer apply. Every mutation is a Server Action that reads
  the Better Auth session and checks membership/ownership explicitly in TypeScript.
- **Hosting:** Vercel free tier (unchanged). App server runtime = Node. The old `vercel.json`
  (Vite rewrites) moved to `legacy/`; switch the Vercel project's framework preset to Next.js
  before merging to `main`.
## Dev environment
 
- Windows 11 + WSL2 (Ubuntu), Node 24 via fnm, pnpm.
- Drizzle driver: `postgres` (postgres.js) + `drizzle-orm/postgres-js` — works against any
  Postgres via `DATABASE_URL`. Use `postgres(url, { prepare: false })` when the URL is a
  Supabase pooler; not required for Neon.
- `DATABASE_URL` lives in `.env.local` (never commit it). `drizzle.config.ts` loads it via
  `@next/env`. Scripts: `pnpm db:push | db:generate | db:migrate | db:studio`.
- DB client: `src/db/index.ts` (`import 'server-only'`, pool cached on `globalThis` in dev).
- Next.js 16 has breaking changes vs. older versions: read the docs bundled in
  `node_modules/next/dist/docs/` before writing Next-specific code (see `AGENTS.md`).
- Code style (matches the old app): single quotes, semicolons, short "why" comments.
 
@AGENTS.md
## Drizzle schema (`src/db/schema.ts`)
 
7 domain tables + `member_role` enum + the Better Auth `user` table (UUID). Better Auth's
CLI (`npx @better-auth/cli generate`) adds/confirms `session`, `account`, `verification`.
 
```ts
import {
  pgTable, pgEnum, uuid, text, boolean, integer, timestamp, unique, index,
} from 'drizzle-orm/pg-core';
 
export const memberRole = pgEnum('member_role', ['admin', 'member']);
 
// AUTH (Better Auth owns this table; UUID ids)
export const users = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().default(''),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
 
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  displayName: text('display_name').notNull().default(''),
  birthday: timestamp('birthday', { mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
 
export const households = pgTable('households', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  secretSantaEnabled: boolean('secret_santa_enabled').notNull().default(false),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
 
export const memberships = pgTable('memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  householdId: uuid('household_id').notNull().references(() => households.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: memberRole('role').notNull().default('member'),
  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique().on(t.householdId, t.userId),
  index('memberships_household_idx').on(t.householdId),
  index('memberships_user_idx').on(t.userId),
]);
 
export const invites = pgTable('invites', {
  id: uuid('id').primaryKey().defaultRandom(),
  householdId: uuid('household_id').notNull().references(() => households.id, { onDelete: 'cascade' }),
  code: text('code').notNull().unique(),          // generated in app (crypto/nanoid)
  email: text('email'),
  role: memberRole('role').notNull().default('member'),
  invitedBy: uuid('invited_by').references(() => users.id, { onDelete: 'set null' }),
  acceptedBy: uuid('accepted_by').references(() => users.id, { onDelete: 'set null' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
}, (t) => [index('invites_code_idx').on(t.code)]);
 
export const inviteRedemptions = pgTable('invite_redemptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  inviteId: uuid('invite_id').notNull().references(() => invites.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [unique().on(t.inviteId, t.userId)]);
 
export const wishlistItems = pgTable('wishlist_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  householdId: uuid('household_id').notNull().references(() => households.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  item: text('item').notNull(),
  link: text('link'),
  claimed: boolean('claimed').notNull().default(false),
  reservedBy: uuid('reserved_by').references(() => users.id, { onDelete: 'set null' }),
  purchased: boolean('purchased').notNull().default(false),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('wishlist_household_idx').on(t.householdId)]);
 
export const assignments = pgTable('assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  householdId: uuid('household_id').notNull().references(() => households.id, { onDelete: 'cascade' }),
  giverId: uuid('giver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  receiverId: uuid('receiver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [unique().on(t.householdId, t.giverId)]);
```
 
## Old RPCs → new implementation
 
All logic was in Supabase `SECURITY DEFINER` functions using `auth.uid()`. Re-implement in
Server Actions: read the session user id, then run Drizzle queries. Keep helpers `isMember(householdId, userId)`
and `isAdmin(householdId, userId)` as small `EXISTS` queries and call them at the top of each action.
 
| Old RPC | New approach |
| --- | --- |
| `reserve_item` | Single conditional UPDATE: `set claimed=true, reserved_by=:me where id=:item and claimed=false` returning rows. 0 rows → already reserved. Also guard: must be member, cannot reserve own item. Preserves atomicity without a function. |
| `cancel_reservation` | UPDATE `… where id=:item and reserved_by=:me`, clear claimed/reserved_by/purchased. |
| `set_purchased` | UPDATE `… where id=:item and reserved_by=:me`. |
| `create_household` | Transaction: insert household (owner=:me) + admin membership. |
| `accept_invite` | Transaction: validate code + expiry, reject if already member, insert membership + redemption, mark invite accepted. |
| `shuffle_assignments` | Server Action + transaction. Admin only, min 3 members. Shuffle member ids in JS, pair cyclically (i → i+1 mod n) so nobody draws themselves, delete + reinsert assignments. |
| `get_household_wishlists` | Drizzle query. Return `is_reserved`, `reserved_by_me`, `purchased_by_me`. NEVER return `reserved_by`. See anonymity note. |
| `get_my_reservations` | Drizzle query `where reserved_by=:me`. |
| `get_invite_redemptions` | Drizzle query, admin-only guard in the action. |
| `is_member`, `is_admin` | TS helper functions (EXISTS queries). |
 
## Triggers
 
- `handle_new_user` (auto-create profile on signup) → Better Auth `databaseHooks.user.create.after`
  inserts the `profiles` row.
- `enforce_invite_cap` (max 5 active invites/household) → enforce in the create-invite action
  (or keep as a plain Postgres trigger; it's portable).
- `rls_auto_enable` (event trigger) → drop, no RLS in the new model.
## Corrections to make during the rebuild
 
1. **Invite codes:** generate in app (`crypto.randomBytes(8).toString('hex')` or nanoid). Drop the
   old `encode(gen_random_bytes(...))` dependency on Supabase's `extensions` schema.
2. **Anonymity (core product promise):** `reserved_by` must never reach the client. Also hide
   `is_reserved` on the viewer's **own** list, or they see their own gift got reserved (a spoiler).
## Guardrails
 
- Never pass the full user object to client components; pass only the fields the UI needs.
- Never run `drizzle-kit push` against a database with real data. Use a fresh/empty Neon DB (or
  local Docker Postgres) for schema iteration. Switch to `drizzle-kit generate` + `migrate`
  (versioned SQL files) once the schema stabilizes.
- Keep `DATABASE_URL`, Better Auth secrets, and the Resend key out of git.
## Suggested build order
 
1. Drizzle schema + client, push to an empty DB. *(done: Neon project, Postgres 18, us-east-1)*
2. Better Auth (email OTP) wired to Resend; run its CLI to generate auth tables; profile-creation hook.
3. `isMember` / `isAdmin` helpers.
4. Server Actions: households → invites → wishlist → reservations → secret santa.
5. Port UI components, routes, and i18n from the old repo.
6. Data migration from the old Supabase DB if real households must be preserved.
 