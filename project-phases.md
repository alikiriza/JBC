# JBC Skin Cream App — Project Phases

## Phase 1: Foundation and Landing Page
- Set up project, GitHub repo and Vercel deployment
- Apply design tokens (green, yellow, blue) from `design-style-guide.md`
- Build the responsive landing page: hero, benefits, conditions, family-safe section, footer note
- "Sign in with Google" button (not yet wired)

**Done when:** the landing page is live on Vercel and looks good on a phone.

## Phase 2: Google Sign-In
- Configure Google OAuth (Google-only)
- Create a user record on first sign-in (name, email, sign-up date)
- Signed-in header state with sign-out
- Protect client pages

Code complete. `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` and
`DATABASE_URL` are real in `.env.local`, and the Google round trip was
confirmed in Phase 5 (the admin account holds a real Google-created
session). If the keys are ever missing, the Google button renders disabled
with "Sign in is temporarily unavailable."

**Done when:** a client can sign in with Google, see their name, and sign out.

## Phase 3: Price Requests
- Request form: size/quantity, optional note about the skin condition
- Save requests to the database, linked to the client
- "My requests" page with status

**Done when:** a signed-in client can submit a request and see it listed as Pending.

## Phase 4: Admin Page
- [x] Admin email allowlist
- [x] Protected admin page: clients list, requests list
- [x] Admin enters a price and reply note, then marks the request Priced
- [x] Client sees the price on "My requests"

Built: `app/admin/**` (gated layout, requests queue, clients list),
`app/api/admin/**` (queue, pricing, clients), `lib/schemas/admin.ts`,
`components/admin/**`, `components/ui/currency-input.tsx`.

Access needs a real `ADMIN_EMAILS` in `.env.local` — it is still
`admin@example.com`. Until it is set, everyone who signs in is refused.

**Done when:** the admin prices a request and the client sees the price. Non-admins cannot open the admin page.

## Phase 5: Polish and Launch
- [x] Mobile checks, loading and empty states, error messages
- [x] Page titles, SEO basics, logo
- [x] Product photos — deferred by choice; custom SVG illustrations retained (see note)
- [x] Final test with a real client account and an admin account
- [ ] Connect the custom domain if available

Code complete. Loading skeletons exist per page (`app/(marketing)/loading.tsx`
scoped to the landing page, `requests-list-skeleton.tsx`, admin queue/client
skeletons), empty and error
states are distinct on every list, and `error.tsx` / `not-found.tsx` are in
place. Every page has a title; the layout carries OpenGraph/Twitter metadata,
a generated share image (`app/opengraph-image.tsx`), `app/sitemap.ts` and
`app/robots.ts`. The logo is `public/logo.svg`.

**Decisions:** product photography is deferred — the app ships with the custom
SVG illustrations (`components/illustrations`) until JBC supplies real photos.
The site stays on the `*.vercel.app` address for now; set `NEXT_PUBLIC_SITE_URL`
to that address on Vercel before sharing, and to a custom domain later if one is
connected (Vercel → Settings → Domains).

The signed-in end-to-end run is done. `pnpm lint` and `pnpm build` are clean,
and a production `next start` was exercised with real session cookies:

- Admin (`alikirizacarol7@gmail.com`, the real account) → `/requests` 200,
  `/admin` 200, `/api/admin/requests` 200.
- A real client session → `/api/requests` 200; posting a request returns it as
  **Pending** with no price; after the admin prices it (`PATCH
  /api/admin/requests/[id]`) the client sees **Priced** with the amount and the
  reply note, and it appears in the admin Priced queue.
- A non-admin session → `/api/admin/requests` **403**; `/admin` and
  `/admin/clients` **307 → `/`** with no page shell rendered.
- Signed out → pages 307 to `/?redirect=…`, APIs 401 JSON.

The Google round trip itself was confirmed earlier: the start of the flow
redirects to `accounts.google.com` with the correct `client_id` and callback,
and the admin account already holds a real Google-created session. Test rows and
sessions created for the run were deleted afterward; the database is unchanged.
See `pre-deploy-review-report.md` §8 for the route-level smoke test.

**Done when:** the app is ready to share with real clients.
