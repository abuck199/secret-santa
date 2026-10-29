# 🎁 ThatWish

Shared wishlists for birthdays and every occasion. Family or group members add
what they'd love to receive, and others quietly **reserve** gifts, so there are
never duplicates and never any spoilers for the recipient. An optional
**Secret Santa** draw is built in per household.

Live at [thatwish.com](https://thatwish.com).

- 🏠 **Households**: create one, or join with an invite link
- 🔑 **No passwords**: sign in with a 6-digit code sent by email
- 📝 **Wishlists** with links and drag-and-drop ordering
- 🤫 **Anonymous reservations**: you never learn who reserved your gift, or even that it's reserved
- 🎂 **Birthdays**: upcoming ones surface on the home page
- 🎲 **Secret Santa**: optional, admin-controlled draw per household
- 🌍 **English / French**, following the browser language
- 🗑️ **Account deletion** built in (Québec Law 25)

## Stack

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 ·
Drizzle ORM · Postgres on [Neon](https://neon.tech) ·
[Better Auth](https://better-auth.com) (email OTP) · [Resend](https://resend.com) ·
Vitest + PGlite · Vercel

All data access is server-side: pages read through `src/server/queries`, and
every change goes through a Server Action in `src/server/actions` that checks
the session and the caller's role before touching the database.

## Getting started

Requirements: Node 24 and pnpm.

```bash
pnpm install
cp .env.sample .env.local   # then fill it in (see below)
pnpm db:migrate             # create the tables in your database
pnpm dev                    # http://localhost:3000
```

### Environment variables (`.env.local`)

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string (a Neon branch of your own; direct URL locally, pooled URL on Vercel) |
| `RESEND_API_KEY` | Resend API key, used to email sign-in codes |
| `EMAIL_FROM` | Sender, e.g. `ThatWish <noreply@thatwish.com>` (the domain must be verified in Resend) |
| `BETTER_AUTH_SECRET` | Long random string signing sessions: `openssl rand -base64 32`, a different one per environment |
| `BETTER_AUTH_URL` | Public URL of the app, e.g. `http://localhost:3000`. Leave it unset on Vercel preview deployments (it's inferred from the request) |

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server |
| `pnpm build` / `pnpm start` | Production build / serve it |
| `pnpm lint` | ESLint (also blocks database imports outside `src/server`) |
| `pnpm typecheck` | Generate Next's route types, then `tsc` |
| `pnpm test` | Server tests against an in-memory Postgres (never touches a real database) |
| `pnpm db:generate` | Turn changes in `src/db/schema.ts` into a new SQL migration in `drizzle/` |
| `pnpm db:migrate` | Apply pending migrations to `DATABASE_URL` |
| `pnpm db:studio` | Browse the database |

## Deployment

GitHub Actions runs lint, typecheck and tests on every push
(`.github/workflows/ci.yml`; no secrets needed). Vercel deploys `main` to
production and every other branch as a preview.
Production uses the Neon `production` branch; previews and local development
use the `dev` branch. Schema changes ship as migrations: run
`pnpm db:migrate` against each branch.

---

Made with 🎁 - ThatWish
