# 🎁 ThatWish

Shared wishlists for birthdays and every occasion. Family or group members add
what they'd love to receive, and others can quietly **reserve** gifts so there
are never duplicates - and never any spoilers for the recipient. An optional
**Secret Santa** draw is built in per household.

- 🏠 **Multi-tenant households** - create or join with an invite link
- 🎂 **Birthdays** - upcoming birthdays surface on the home page
- 📝 **Wishlists** with drag-and-drop ordering and optional links
- 🤫 **Anonymous reservations** - recipients never see what's reserved
- 🎲 **Optional Secret Santa** draw (admin-controlled, per household)
- 🌍 **Bilingual** - English / French toggle
- 🔐 **Supabase Auth** (email + password) with Row-Level Security; the browser
  only ever uses the public anon key

## Stack

React 19 + Vite · Tailwind CSS · Supabase (Postgres + Auth + RLS) ·
@dnd-kit · lucide-react · react-hot-toast

## Setup

```bash
npm install
cp .env.sample .env   # then fill in your Supabase URL + anon key
npm run dev           # Vite dev server on http://localhost:3000
```

Other scripts: `npm run build` (production build to `dist/`) and
`npm run preview` (serve the built app locally).

### 1. Database

Run `db/schema.sql` in your Supabase project's SQL editor (already done if you
ran it during setup). It creates the tables, RLS policies and the
SECURITY DEFINER RPCs the app relies on.

### 2. Supabase Auth settings

- Enable the **Email** provider.
- Set **Site URL** to your app origin (e.g. `http://localhost:3000` in dev).
- Add your origin to **Redirect URLs** (used by signup confirmation and the
  password-reset link).
- For local testing you may turn off "Confirm email" so signups log in
  immediately.

### 3. Environment variables (`.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | yes | Public anon / publishable key |

## Security model

There is **no service key in the browser**. Every read is constrained by RLS and
every privileged write goes through a SECURITY DEFINER RPC:

- `create_household`, `accept_invite`
- `get_household_wishlists` (masks the reserver - only `is_reserved` /
  `reserved_by_me` are ever exposed)
- `reserve_item`, `cancel_reservation`, `set_purchased`, `get_my_reservations`
- `shuffle_assignments` (admin only)

---

Made with 🎁 - ThatWish
