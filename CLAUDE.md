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
- **Hosting:** Vercel free tier, same `thatwish` project and domain (unchanged). App server
  runtime = Node 24 (`engines` in package.json). The root `vercel.json` sets
  `"framework": "nextjs"` (the old Vite one moved to `legacy/`), so no dashboard preset change
  is needed: until the merge, `main` still builds as Vite from its own `vercel.json`.
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
   *(done: `src/lib/auth.ts`, `src/lib/email.ts`, `src/lib/auth-client.ts`, route
   `src/app/api/auth/[...all]`. Auth tables are hand-written in `schema.ts` (the CLI can't load
   a `server-only` config). OTPs are stored hashed; the email is sent via `after()`. Email
   language comes from `Accept-Language` until the i18n port provides an explicit one. For
   reading the session in pages, follow `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md`.)*
3. `isMember` / `isAdmin` helpers. *(done: Data Access Layer in `src/server/`)*
   - `session.ts`: `getSessionUser()` (narrow `{ id, email }`, deduped per request with React
     `cache`) and `requireUser()` (redirects to `/login`).
   - `authz.ts`: `isMember`, `isAdmin` (reject malformed UUIDs instead of letting Postgres 500),
     `requireMember(householdId)` / `requireAdmin(householdId)` throwing `ActionError('forbidden')`.
   - **Rule, enforced by ESLint `no-restricted-imports`:** only `src/server/**` (plus `src/db`,
     `src/lib/auth.ts` and the auth route) may import `@/db` or `@/lib/auth`. Pages, components
     and actions call `src/server` functions.
   - Not using `'use cache: private'` for the session yet (React `cache` works the same in
     Server Actions); revisit when tuning prefetching.
4. Server Actions: households → invites → wishlist → reservations → secret santa.
   **Layout:** `src/server/queries/*` = server-only reads for Server Components (throw
   `ActionError`/redirect); `src/server/actions/*` = `'use server'` mutations returning
   `ActionResult` (`{ ok: true, data } | { ok: false, error: ErrorCode }`) via `runAction()` in
   `result.ts`. The UI translates `error` as `err.<code>`. Validate every input with zod (v4).
   **Never export a helper from a `'use server'` file** (every export is a public endpoint);
   shared internals go in plain server-only modules like `memberships.ts`.
   - 4a profile *(done)*: `getMyProfile`, `updateProfile`. The old generic `getProfiles(ids)` is
     dropped; names come from purpose-built queries (members, reservations, assignment).
   - 4b households *(done)*: create (tx: household + admin membership), rename / Secret Santa
     toggle (admin), delete (owner only), leave (anyone but the owner → `owner_cannot_leave`,
     and not while Secret Santa is on and they give/receive in the draw → `in_active_draw`;
     the admin turns Secret Santa off when the season ends, which frees everyone).
   - 4c members *(done)*: `getMembers` (member), `setMemberRole` / `removeMember` (admin; not
     yourself → `cannot_change_self`, never the owner → `cannot_change_owner`). Admin removal
     works even during an active draw (deliberate override; the admin re-draws).
     Leaving or being removed (`removeFromHousehold`) deletes that person's items in the
     household and voids draw pairings involving them. Gifts they reserved but had not bought
     go back to the pool; gifts already bought stay taken (`reserved_by` cleared) so nobody
     buys a duplicate.
   - 4d invites *(done)*: `createInvite` (admin; 16-hex code from `crypto.randomBytes`, valid 30
     days, multi-use; max 5 non-expired per household, enforced under a `FOR UPDATE` lock on the
     household → `invite_cap` with `{max}`), `deleteInvite` (admin), `getInvites` (admin; creator
     name + joiners, replaces `get_invite_redemptions`), `acceptInvite(code)` (any signed-in user;
     unknown and expired both → `invite_invalid`; `already_member` with `{name}`; records the
     redemption, `accepted_by` = first user). A removed member can rejoin while the link is valid.
     Errors may carry `params` for the translated message (`ActionError(code, params)`).
   - 4e wishlist *(done)*: `getMyItems`, `addItem` (member; max 50 per person per household →
     `wishlist_full`; item 1–200 chars; link ≤500, re-normalized server-side with
     `src/lib/url.ts` → `invalid_link`; appended at the bottom), `updateItem` / `deleteItem`
     (owner only, `user_id = me` in the WHERE → `not_found`), `reorderItems(householdId, ids)`
     (ignores ids that aren't yours).
   - 4f reservations *(done)*: `getHouseholdWishlists` (builds each row field by field: never
     `reserved_by`; `isReserved` forced false on your own items), `getMyReservations(householdId)`,
     `reserveItem` (single conditional UPDATE `where claimed = false` → `already_reserved`;
     `own_item`), `cancelReservation` / `setPurchased` (`where reserved_by = me`).
   - 4g secret santa *(done)*: `shuffleAssignments` (admin, Secret Santa on → `santa_disabled`,
     ≥3 members → `santa_min_members`; crypto Fisher-Yates, cyclic pairing, household row locked),
     `getMyAssignment` (only your own pairing, only while Secret Santa is on; nobody, admins
     included, can see the full draw).
   Tested end to end with temporary `dev-login` / `dev-call` routes (deleted afterwards):
   `auth.api.createVerificationOTP` signs test users in without sending email.
5. Port UI *(done: 5a foundations, 5b public pages, 5c auth, 5d app, 5e analytics; see below)*.
   **5a foundations:**
   - **Language routing (hybrid, decided with the user):** every page lives under
     `src/app/[lang]/` (root layout there, `generateStaticParams` en/fr, pages stay prerendered).
     Visible URLs carry **no language** (`/app/list`, `/join/abc`): `src/proxy.ts` rewrites them
     internally to `/{lang}/...`, with lang = `lang` cookie, else the browser's best supported
     Accept-Language (`localeFromAcceptLanguage` honors q-weights; other languages and crawlers
     → English). Public pages (`PUBLIC_PATHS`: `/`, `/login`, `/privacy`, `/terms`) also have a
     crawlable `/fr/...` twin for Google (sitemap + hreflang); visiting any `/fr` URL without a
     cookie sets `lang=fr`. `/fr/<non-public>` (old links) and `/en/...` redirect to the plain
     URL. In-app links use plain paths; `localizedPath()` is for SEO only. API routes and
     `public/` files skip the proxy. Unknown locale → 404.
     Check at cutover: on Vercel, `/` from a French vs English browser must return the right
     language (the CDN should cache per rewritten path; Next overrides our `Vary` header).
   - **i18n:** `src/i18n/translations.ts` is the old file as-is (same flat keys, `{placeholders}`).
     Server Components: `const t = await getT()` (`src/i18n/server.ts`, reads `next/root-params`).
     Client Components: `const { t, lang } = useI18n()` (`src/i18n/client.tsx`). Links: build
     hrefs with `localizedPath(path, lang)`. The toggle sets the `lang` cookie (also used for the
     OTP email language) and does a **full page load** of the same URL (or the plain URL from a
     `/fr` page). Not `router.refresh()`: lang is the root param, and client-rendering a new
     root layout re-creates `<html>` and makes React warn about the theme `<script>`.
   - **Styles:** `src/app/globals.css` = old `index.css` + `tailwind.config.js` in Tailwind 4 form:
     tokens in `@theme inline`, component classes (`card`, `input`, `btn-*`, `chip`, `link`, …)
     as `@utility`, `.dark` class variant. Fonts via `next/font/google` (self-hosted at build).
   - **Theme:** inline script in `<head>` applies `.dark` before paint (localStorage
     `thatwish:theme`, else OS); `ThemeToggle` reads the class on `<html>`. Keep it a plain
     `<script>`: `next/script` `beforeInteractive` queues inline code until Next's JS loads (flash).
   - Ported: `Brand`, `ThemeToggle`, `LanguageToggle`, `Toaster` (react-hot-toast), lucide icons.
   **5b public pages *(done)*:** landing (`src/app/[lang]/page.tsx`, all CTAs → `/login` since
   sign-up and sign-in are one OTP flow), `/privacy` and `/terms` (`LegalLayout`, content updated:
   Neon instead of Supabase, no Google, sign-in codes instead of passwords, session cookie + `lang`
   cookie described; `UPDATED` = 2026-10-28, set it to the go-live date at cutover), `Footer`.
   SEO: each page's `generateMetadata` uses `alternates(path, lang)` from `src/lib/seo.ts`
   (canonical + hreflang en/fr/x-default); `src/app/sitemap.ts` replaces `public/sitemap.xml`;
   `robots.txt` also disallows `/fr/app`, `/fr/join`.
   - Gotcha: Cache Components rejects `new Date()` during prerender, even in Client Components
     (the footer year is read with `useSyncExternalStore`, browser only).
   **5c auth:** `/login` (`login-form.tsx`): email → `authClient.emailOtp.sendVerificationOtp` →
   6-digit code (auto-submits, one-time-code autofill, 30 s resend cooldown) →
   `authClient.signIn.emailOtp` → `?next=` (same-site paths only) or `/app`. New emails get an
   account on the spot. `/signup` → `/login` (next.config redirects). Proxy: optimistic
   redirects on session-cookie presence only (`/` → `/app` when signed in; `/app/*`, `/join/*` →
   `/login?next=…` when not); the real check stays in `src/server`. Dead translation keys
   (passwords, Google, reset, email confirmation) removed; new `auth.*`, `profile.*` and `err.*`
   keys added. **5d app:** `src/app/[lang]/app/layout.tsx` = the old AppGuard inside Suspense:
   no name/birthday → `redirect('/welcome')` (`CompleteProfile`), no household →
   `redirect('/start')` (`Onboarding`), else NavBar + page + Footer. The gates are their own
   routes (not swapped in place) because a layout that drops its page breaks Next's instant
   navigation validation. Known dev-only noise: the request that triggers a gate redirect logs
   "Could not validate `instant` … NEXT_REDIRECT" (`instant = false` doesn't silence it); harmless;
   every data page has a `loading.tsx` (Cache Components wants a boundary per segment for instant
   navigation). Pattern: server `page.tsx` reads via `src/server/queries` and passes plain props
   to a client component that calls Server Actions, shows `actionErrorMessage(t, res)` toasts,
   updates local state, and calls `router.refresh()` when the nav/household changes.
   Current household = `household` cookie (httpOnly, set by `switchHousehold`, `createHousehold`,
   `acceptInvite`; `getCurrentHousehold()` validates it against memberships, falls back to the
   first). `/join/[code]`: signed in → `JoinInvite` accepts on mount (a POST, not during render).
   Settings hides "leave" for the owner and role/remove buttons on the owner and yourself.
   **Account deletion** (Law 25, promised by the privacy policy; decided with the user):
   `deleteAccount` in `src/server/actions/account.ts`, button in Profile. Owned households go to
   another admin, else the longest-standing member (made admin); empty ones are deleted. Then
   the usual leave cleanup in every household, then the user row (cascades). Signs out first.
   **5e:** `<Analytics />` from `@vercel/analytics/next` in the root layout.
   **Activity gotcha (Cache Components):** Next keeps the last ~3 visited routes mounted but
   hidden, with their React state. So: sign-out and account deletion do a full page load
   (`window.location.href = '/'`, per Next's "State and authentication" guide) so no hidden
   route keeps the previous user's data; the login form resets to the email step in a
   `useLayoutEffect` cleanup (a stale one-time code would auto-submit). Reset any other
   transient state the same way (`node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md`).
6. Hardening *(done)*:
   - **Rate limiting:** Better Auth `rateLimit: { storage: 'database' }` (table `rate_limit`;
     the OTP plugin's own rule is 3 requests/min per IP; on in production only). Plus our own
     per-address cap, `src/server/otp-throttle.ts`: 5 code emails/hour per email (sha256 key in
     the same table), checked in `sendVerificationOTP` and silently skipped when hit, so the
     Resend quota can't be burned and addresses can't be probed.
   - **Step 4 leftovers fixed:** `addItem` takes a `pg_advisory_xact_lock` per person+household
     (cap holds under racing adds); `reorderItems` dedupes ids.
   - **Migrations:** schema changes now go through `pnpm db:generate` (versioned SQL in
     `drizzle/`, baseline `0000_*`) + `pnpm db:migrate`. The Neon `production` branch was built
     with `push`; `pnpm db:baseline` (`scripts/db-baseline.mjs`) recorded `0000_*` as applied
     on it (2026-10-28), so branches created from it after that inherit the baseline. Never
     `push` again.
   - **Tests:** `pnpm test` (Vitest + PGlite in-memory Postgres built from `drizzle/`; never
     touches Neon). `tests/setup.ts` mocks `@/db`, `@/server/session` (`signInAs()`),
     `next/headers`, `next/navigation`, `@/lib/auth`; everything in `src/server` runs for real.
     31 tests: anonymity, reservations (incl. concurrent), wishlist caps/ownership/reorder,
     household/member rules, leave cleanup, invites, draw validity, account deletion, OTP cap.
     Add a test with every new action or rule.
   - **Error pages:** `src/app/global-not-found.tsx` (experimental `globalNotFound`; our root
     layout is under `[lang]`, so unmatched URLs can't use a normal `not-found.tsx`; it carries
     its own CSS/fonts/theme script and picks the language in the browser), `[lang]/not-found.tsx`
     for `notFound()` in pages, `[lang]/error.tsx` (retry), `app/global-error.tsx` (bilingual,
     inline styles). A `[lang]/[...missing]` catch-all does NOT work in production (its
     prerendered shell becomes Next's empty error shell).
   - **Security review:** every `'use server'` export validates (zod) and authorizes before
     writing; only actions are exported; `reserved_by` never leaves queries; emails only reach
     their owner. Security headers in `next.config.ts` (X-Frame-Options DENY, nosniff,
     Referrer-Policy, Permissions-Policy, HSTS). Not done (judgment calls, revisit if needed):
     CSP (needs a nonce/hash for the inline theme script), re-auth before account deletion,
     a cap on households created per user.
7. Data migration from Supabase: *skipped, the old app had no real users or households
   (confirmed by the user).*
8. Cutover: Vercel prod env vars (`BETTER_AUTH_URL=https://thatwish.com`), framework preset →
   Next.js, short freeze + final data sync, merge `next-rebuild` → `main`. Also:
   - Neon pooled URL (`-pooler` host) for Vercel; `src/db/index.ts` turns off postgres.js
     prepared statements for pooler URLs.
   - `BETTER_AUTH_URL` is set for **Production only**. Without it Better Auth infers the base
     URL from the request (`better-auth/dist/utils/url.mjs`), so preview deployments work on
     their own *.vercel.app URLs; a wrong value there means `INVALID_ORIGIN` on sign-in.
   - Confirm Better Auth sees real client IPs on Vercel (`rate_limit` keys must not all be the
     same, or every visitor shares one bucket).
   - Separate databases *(done 2026-10-28)*: Neon branch `dev` (child of `production`, no
     auto-delete) is what `.env.local` and Vercel **Preview** use; `production` is for Vercel
     **Production** only.
   - Legal pages' `UPDATED` date = go-live date.
9. Cleanup: delete `legacy/`, update README; after a few quiet weeks delete the Supabase project
   and its Resend key.

## Dev gotchas

- Files edited from Windows through `\\wsl.localhost\...` may not trigger Next's file watcher in
  WSL; if the dev server serves stale code, restart `pnpm dev`. Opening the folder with VS Code's
  WSL extension (`code .` from Ubuntu) avoids it.
 