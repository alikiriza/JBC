# JBC — private price-request app

Clients sign in with Google, describe what they need, and get a **private** quote.
Nothing is public. There is no public price list, no indexed content, and no
contact form that anyone can use without an account.

- Clients see **only their own** requests, statuses, and prices.
- The admin sees **every** request and sets prices and notes.
- No email, SMS, or notification is sent anywhere — pricing stays inside the app.

> **Status:** Phases 1–4 are implemented and building. Deployment and real product
> photography are still outstanding. See [Project status](#project-status).

---

## Stack

| Layer      | Choice                                                     |
| ---------- | ---------------------------------------------------------- |
| Framework  | Next.js 16 (App Router) · React 19 · TypeScript 5           |
| Styling    | Tailwind CSS 4 · shadcn/ui-style components (Radix UI)     |
| Auth       | Better Auth — Google OAuth only                            |
| Database   | PostgreSQL (Neon) via Prisma 7 · `@neondatabase/serverless` |
| Validation | Zod 4 · React Hook Form                                     |
| Data/cache | TanStack Query 5 · Upstash Redis (optional)                |

---

## Getting started

### 1. Install

```bash
pnpm install
```

`postinstall` runs `prisma generate`, so the client is ready automatically.

### 2. Configure the environment

```bash
cp .env.example .env.local
```

Then fill in `.env.local`:

| Variable               | Required | What it is                                                     |
| ---------------------- | -------- | -------------------------------------------------------------- |
| `DATABASE_URL`         | yes      | Neon **pooled** connection string                              |
| `BETTER_AUTH_SECRET`   | yes      | Random secret; generate with `openssl rand -base64 32`         |
| `BETTER_AUTH_URL`      | yes      | App origin — `http://localhost:3000`                           |
| `GOOGLE_CLIENT_ID`     | yes      | Google Cloud → APIs & Services → Credentials                  |
| `GOOGLE_CLIENT_SECRET` | yes      | same                                                           |
| `ADMIN_EMAILS`         | yes      | Comma-separated allowlist of admin emails                      |
| `UPSTASH_REDIS_URL`    | no       | Optional cache — app runs without it                            |
| `UPSTASH_REDIS_TOKEN`  | no       | Optional cache — app runs without it                            |

**Google OAuth** — add this exact authorized redirect URI in Google Cloud:

```
http://localhost:3000/api/auth/callback/google
```

It must match `BETTER_AUTH_URL` exactly, including the port.

> `.env.local` is gitignored. Never commit it. `.env.example` **is** tracked, so it
> must only ever contain placeholders.

### 3. Create the tables

```bash
pnpm db:push
```

Optional demo data:

```bash
pnpm db:seed
```

The seed creates sample clients and requests for filling the admin queue, but
**deliberately creates no account rows** — nobody in the seed data can sign in.

### 4. Run

```bash
pnpm dev
```

Open <http://localhost:3000>.

### 5. Sign in as admin

Use the **exact** email listed in `ADMIN_EMAILS`. On first sign-in the app syncs
the account's `isAdmin` flag automatically, so no database editing is needed.

> Change `ADMIN_EMAILS` from its example value before going live. Anyone not on
> the list is refused at `/admin` **and** on every admin API route, even if they
> signed in with Google successfully.

---

## Scripts

| Script            | Purpose                                             |
| ----------------- | --------------------------------------------------- |
| `pnpm dev`        | Dev server                                          |
| `pnpm build`      | Production build                                    |
| `pnpm start`      | Serve the production build                          |
| `pnpm lint`       | ESLint                                              |
| `pnpm db:push`    | Sync schema to the database                         |
| `pnpm db:studio`  | Prisma Studio — browse data                         |
| `pnpm db:seed`    | Insert sample clients and requests                  |
| `pnpm db:generate`| Regenerate Prisma Client after editing the schema   |
| `pnpm db:reset`   | **Destructive.** Wipe the database, then reseed     |

---

## Routes

| Route                        | Access | What it does                                    |
| ---------------------------- | ------ | ----------------------------------------------- |
| `/`                          | public | Landing page with Google sign-in                |
| `/requests`                  | client | The signed-in client's own requests and prices   |
| `/requests/new`              | client | Submit a new price request                      |
| `/admin`                     | admin  | Price-request queue                             |
| `/admin/clients`             | admin  | Every client and their request count            |

### API

| Endpoint                          | Access  | Method    |
| --------------------------------- | ------- | --------- |
| `/api/requests`                   | client  | `GET`/`POST` |
| `/api/admin/requests`             | admin   | `GET`     |
| `/api/admin/requests/[id]`        | admin   | `PATCH`   |
| `/api/admin/clients`              | admin   | `GET`     |
| `/api/auth/[...all]`              | —       | Better Auth |

Unauthenticated API calls return `401 {"error":"Unauthorized"}`. Only pages
redirect to the landing page — an API route never answers with HTML.

---

## How admin access is enforced

Admin is gated **twice**, and both checks run on every admin request:

1. The session user's `isAdmin` flag.
2. A live check that their email is still in `ADMIN_EMAILS`.

That means revoking admin is immediate: remove the email from `ADMIN_EMAILS` and
access stops on the next request, with no need to clear flags in the database. The
client table is kept private for the same reason — every client has a name, an
email, and a health note.

`proxy.ts` only performs a cheap cookie-presence check to avoid needless database
work. It is **not** the security boundary; `requireSession()` and `requireRole()`
inside the routes are.

---

## Project layout

```
app/
  page.tsx                    landing page
  requests/                   client request list + new request form
  admin/                      admin queue + client list
  api/                        requests, admin, and Better Auth routes
components/
  admin/                      request table, pricing sheet, client table
  requests/                   client request components
  site/                       nav, footer, hero
  ui/                         shared primitives
lib/
  auth.ts                     Better Auth: Google provider + admin sync hook
  admin.ts                    allowlist + verifyAdmin()
  auth-guard.ts               requireSession(), requireRole()
  cache.ts                    React cache helpers + tags
  schemas/                    Zod contracts
  db.ts                       Prisma client (Neon serverless adapter)
proxy.ts                      cookie-presence check
prisma/schema.prisma          User, Session, Account, Verification, PriceRequest
```

---

## Project status

Tracked in `project-phases.md`.

- [x] Phase 1 — landing page, design system
- [x] Phase 2 — Google sign-in, database
- [x] Phase 3 — client price requests
- [x] Phase 4 — admin queue, pricing, client list
- [ ] Phase 5 — real product photos and logo, end-to-end tests, custom domain

Before this app is usable in production:

- [ ] Real product photography and a proper logo (currently placeholders)
- [ ] Set a real `ADMIN_EMAILS`
- [ ] Confirm the GitHub repository is **private**
- [ ] Deploy to Vercel and set the environment variables there too — the local
      `.env.local` does not travel with the code
- [ ] Change `BETTER_AUTH_URL` to the real production origin
- [ ] Run a manual pass through sign-in → submit request → price → client sees price

---

## Deployment notes

The app expects Node.js 20+ and a pooled Postgres connection string. On Vercel:

1. Import the repository.
2. Add every variable from `.env.example` under **Settings → Environment Variables**.
3. Use the **pooled** Neon URL, not the direct one.
4. Deploy. No custom build command is needed — `pnpm build` runs by default.

Once deployed, remember to change `BETTER_AUTH_URL` to the production domain and
add the matching production redirect URI in Google Cloud.

---

## Notes and gotchas

- **Google only.** There is no email/password sign-in, by design.
- **`ADMIN_EMAILS` is the real authority.** The `isAdmin` flag alone is not enough.
- **Rotating a leaked secret** means updating `.env.local` *and* the environment
  variables on Vercel. Google client secrets are revoked in Google Cloud.
- **Pushing a new admin path?** Both `isAdmin` **and** the `ADMIN_EMAILS` allowlist
  must pass, so do not relax one without the other.