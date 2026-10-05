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

Code complete. **Not yet runnable:** `GOOGLE_CLIENT_ID` and
`GOOGLE_CLIENT_SECRET` are empty and `DATABASE_URL` is a placeholder, so
sign-in has never actually been exercised. Until both are real, the Google
button renders disabled with "Sign in is being connected now".

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
- Mobile checks, loading and empty states, error messages
- Page titles, SEO basics, product photos, logo
- Final test with a real client account and an admin account
- Connect the custom domain if available

**Done when:** the app is ready to share with real clients.
