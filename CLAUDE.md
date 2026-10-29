# CLAUDE.md — ThatWish

ThatWish is a shared-wishlist web app (family/group wishlists for birthdays and Secret Santa,
with quiet gift reservations so there are no duplicates and no spoilers). Live at
https://thatwish.com. The README covers setup, env vars and scripts.

History: rebuilt in Oct 2026 from a React/Vite SPA on Supabase (RLS + `SECURITY DEFINER`
RPCs, password + Google auth) onto this stack; went live 2026-10-28. The old app had no real
users, so no data was migrated.

@AGENTS.md

## Stack and key decisions

- **Next.js 16** (App Router, `cacheComponents`, `partialPrefetching`) + TypeScript + Tailwind 4.
  Next 16 has breaking changes: read `node_modules/next/dist/docs/` before Next-specific code.
- **Neon Postgres** via Drizzle ORM + postgres.js (`src/db/index.ts`; prepared statements off for
  `-pooler` URLs). Chosen over Supabase, whose free tier pauses after 7 idle days. Portable.
- **Better Auth, email OTP only** (`src/lib/auth.ts`), self-hosted in the app, tables in our DB.
  No passwords, no OAuth. UUID ids. A `databaseHooks.user.create.after` hook creates `profiles`.
- **Resend** for the code emails (`src/lib/email.ts`, EN/FR). Free tier: 100/day.
- **Vercel** (project `thatwish`), Node 24 (`engines`), `vercel.json` sets the Next.js preset.
- **Authorization lives in the app**: one DB role, no RLS. Every mutation is a Server Action that
  reads the session and checks membership/role explicitly.

## Architecture rules

- **Data Access Layer:** only `src/server/**` (plus `src/db`, `src/lib/auth.ts`, the auth route)
  may import `@/db` or `@/lib/auth`; ESLint `no-restricted-imports` enforces it.
  - `src/server/session.ts`: `getSessionUser()` (narrow `{ id, email }`, React `cache`),
    `requireUser()` (redirects to `/login`).
  - `src/server/authz.ts`: `requireMember`, `requireAdmin` (session + role check; malformed
    UUIDs → no access, not a 500).
  - `src/server/queries/*`: server-only reads for Server Components.
  - `src/server/actions/*`: `'use server'` mutations returning `ActionResult`
    (`{ ok: true, data } | { ok: false, error, params? }`) via `runAction()` (`result.ts`).
    Validate every input with zod v4; authorize before writing; `throw new ActionError(code,
    params)` for expected failures. The UI shows `actionErrorMessage(t, res)` (`err.<code>` keys).
  - **Never export a helper from a `'use server'` file**: every export is a public endpoint.
    Shared internals go in plain server-only modules (`memberships.ts`, `otp-throttle.ts`).
- **Anonymity is the core promise:** `reserved_by` never leaves the server; queries build rows
  field by field and only expose `isReserved` / `reservedByMe` / `purchasedByMe`, with
  `isReserved` forced false on the viewer's own items.
- Never pass the full user object to client components, only the fields the UI needs.
- UI pattern: server `page.tsx` reads via `src/server/queries`, passes plain props to a client
  component that calls Server Actions, updates local state, and calls `router.refresh()` when the
  nav/household changes. Current household = `household` cookie (httpOnly), validated against
  memberships by `getCurrentHousehold()`.
- `/app` layout = guard: no name/birthday → `/welcome`, no household → `/start`, else chrome.
  The gates are routes (a layout that drops its page breaks instant-navigation validation).
- Code style: single quotes, semicolons, short "why" comments.

## Product rules (decided with the owner)

- Roles: admin renames, toggles Secret Santa, draws, manages invites/members. Only the owner
  deletes the household; the owner can't leave. Admins can't change themselves or the owner.
- Can't leave while Secret Santa is on and you're in the draw (`in_active_draw`); the admin turns
  it off after the season or removes you. Leaving/removal: your items in that household go,
  unbought reservations are released, bought ones stay taken (anonymously), your draw pairings
  are voided.
- Invites: 16-hex codes, multi-use, 30 days, max 5 active per household (locked count). Unknown
  and expired codes give the same error. Everyone who joins by link is a plain member; who
  joined through which link is in `invite_redemptions`. A removed member can rejoin with a
  valid link.
- Wishlist: max 50 items per person per household (advisory lock), links re-validated
  server-side (`src/lib/url.ts`). Draw: crypto shuffle, cyclic pairing, ≥3 members; nobody
  (admins included) sees the full draw.
- Account deletion (Law 25): owned households go to another admin, else the longest-standing
  member; empty ones are deleted; then the leave cleanup everywhere; then the user row.

## i18n and routing

- Every page lives under `src/app/[lang]/` (root layout there). Visible URLs carry **no
  language**: `src/proxy.ts` rewrites to `/{lang}/…` from the `lang` cookie, else the browser's
  Accept-Language (`localeFromAcceptLanguage`; others and crawlers → English). Public pages
  (`PUBLIC_PATHS`) also have crawlable `/fr/…` twins (sitemap + hreflang); other `/fr/…` and
  `/en/…` URLs redirect to the plain path. In-app links use plain paths; `localizedPath()` is
  for SEO only. Verified: Vercel's CDN caches per language.
- Proxy also does optimistic auth redirects on session-cookie presence only (`/` → `/app` when
  signed in; `/app|join|welcome|start` → `/login?next=…` when not). The real check is in
  `src/server`.
- Translations: `src/i18n/translations.ts` (flat keys, `{placeholders}`, EN and FR in sync).
  Server: `await getT()`; client: `useI18n()`. The whole dictionary ships to the client, so keep
  dead keys out.
- The language toggle sets the cookie and does a **full page load** (lang is the root param;
  client-rendering a new root layout re-creates `<html>`).

## Gotchas (learned the hard way)

- **Cache Components:**
  - Reading cookies/headers/session needs a `<Suspense>` boundary; each data page under `/app`
    has a `loading.tsx` for instant navigation between pages.
  - `new Date()` during prerender is rejected, even in Client Components (footer year uses
    `useSyncExternalStore`).
  - **Activity:** the last ~3 routes stay mounted but hidden, with their state. Sign-out and
    account deletion do a full page load (`window.location.href = '/'`) so no hidden route keeps
    a previous user's data; transient state (e.g. the login code step) resets in a
    `useLayoutEffect` cleanup. See `node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md`.
  - Dev-only noise: a request that triggers the `/welcome` or `/start` redirect logs "Could not
    validate `instant` … NEXT_REDIRECT". Harmless.
- **Theme:** plain inline `<script>` in `<head>` (localStorage `thatwish:theme`, else OS). Not
  `next/script` `beforeInteractive`: it waits for Next's JS and flashes.
- **404:** unmatched URLs use `src/app/global-not-found.tsx` (experimental `globalNotFound`; it
  carries its own CSS, fonts (shared `src/app/fonts.ts`) and theme script, and picks the
  language in the browser). A `[lang]/[...missing]`
  catch-all does NOT work in production. `[lang]/not-found.tsx` handles `notFound()` in pages;
  `[lang]/error.tsx` and `app/global-error.tsx` handle crashes.
- **Rate limiting:** Better Auth limits per IP in the DB (`rate_limit` table, production only);
  `src/server/otp-throttle.ts` caps 5 code emails/hour per address (silently skipped, so it
  can't be used to probe addresses or burn the Resend quota).
- Files edited from Windows through `\\wsl.localhost\...` may not trigger Next's file watcher;
  restart `pnpm dev` if it serves stale code (or open the folder with VS Code's WSL extension).
- Vercel previews sit behind Vercel Authentication, and Vercel's bot checkpoint answers 429 to
  curl (production too), so check deployments in a browser and read the DB for evidence.

## Database and environments

- Neon branches: `production` (Vercel Production only) and `dev` (local `.env.local` and
  Vercel Preview; no auto-delete). Use direct URLs locally, pooled (`-pooler`) on Vercel.
- **Schema changes:** edit `src/db/schema.ts` → `pnpm db:generate` → commit the SQL in
  `drizzle/` → `pnpm db:migrate` on `dev`, then on `production` at deploy time. Never use
  `drizzle-kit push` (both branches were baselined on 2026-10-28 and track migrations).
  **Order matters:** for a migration that removes something, deploy the code that stops using
  it first, then migrate production; for one that adds something, migrate first. Production is
  migrated by the owner from their terminal (`DATABASE_URL='<prod direct URL>' pnpm db:migrate`,
  with a leading space to keep it out of shell history), so the URL never passes through Claude.
- Migrations: `0000` baseline; `0001` dropped the unused `invites` columns (`email`, `role`,
  `accepted_by`, `accepted_at`).
- `BETTER_AUTH_URL` is set for Production only; previews infer it from the request. A wrong value
  causes `INVALID_ORIGIN` on sign-in.
- Secrets (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `RESEND_API_KEY`) stay out of git; one
  `BETTER_AUTH_SECRET` per environment.

## Tests and CI

`.github/workflows/ci.yml` runs `pnpm lint`, `pnpm typecheck` (`next typegen` first: `tsc` needs
Next's generated route types) and `pnpm test` on every push; no secrets needed.

`pnpm test`: Vitest + PGlite (in-memory Postgres built from `drizzle/`; never touches Neon).
`tests/setup.ts` mocks `@/db`, `@/server/session` (`signInAs()`), `next/headers`,
`next/navigation` and `@/lib/auth`; everything in `src/server` runs for real. Covers anonymity,
reservations (incl. concurrent), wishlist rules, household/member rules, invites, draw validity,
account deletion and the OTP cap. **Add a test with every new action or rule.**

## Open items

- After a few quiet weeks: delete the old Supabase project, the Supabase/Google OAuth client, and
  any Resend key used only by Supabase. Remove the `VITE_*` env vars from Vercel.
- Judgment calls not done (revisit if needed): CSP (needs a nonce/hash for the theme script),
  re-auth before account deletion, a cap on households created per user.
