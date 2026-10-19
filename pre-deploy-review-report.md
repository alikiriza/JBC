# JBC Skin Cream App — Pre-Deploy Review Report

**Reviewed against:** `pre-deploy-review.md` (CPU/resource, performance, background jobs, security, copy integrity, design judgment)
**Stack:** Next.js 16 (App Router, Turbopack) · TypeScript · Prisma 7 + Neon Postgres · Better Auth · React Query · Upstash Redis · Tailwind v4 · shadcn/ui
**Method:** source audit of every route handler, lib module, schema, page and marketing component. `pnpm lint` and `pnpm build` both pass with zero errors.

---

## 1. Executive Summary

| Severity | Found | Fixable now | Outstanding |
|---|---|---|---|
| Critical | 0 | 0 | 0 |
| High | 2 | 2 | 0 |
| Medium | 4 | 1 | 3 |
| Low | 5 | 3 | 2 |

**Verdict.** This is a small, tightly-scoped app and the security fundamentals are
already right: every route handler starts with `requireSession()` / `requireRole()`,
every write body is Zod-validated, every client query is scoped to
`session.user.id`, open redirects on the sign-in callback are closed, secrets are
gitignored, and no client email or price is reachable without proving who is
asking. There are **no Critical findings.**

The two High items were a missing set of HTTP security headers (fixed) and a
currency/region inconsistency, now resolved: JBC confirmed the WhatsApp contact
is Ugandan (+256) and that prices are in **Ugandan shillings (UGX)**, so the
naira placeholders were switched to UGX throughout (§3, H2). Everything else is
hardening for scale that this app does not yet have.

---

## 2. Critical Issues

None.

---

## 3. High Priority Issues

### H1 — No HTTP security headers are sent

**Location:** `next.config.ts:3-7` (empty config)

The app ships none of the standard response headers. Next.js does not add them
by default.

**Risk.** Two of these matter for JBC specifically:
- **Clickjacking.** Without `X-Frame-Options` / `frame-ancestors`, the admin
  panel and the pricing sheet can be framed by another site. An admin clicking
  a transparent overlay can be made to price a request.
- **MIME sniffing.** Without `X-Content-Type-Options: nosniff`, a browser may
  interpret a JSON API response as HTML, which re-opens XSS vectors.
- **Referrer leakage.** The default referrer policy leaks full URLs (including
  the `?redirect=` value) to any outbound link, e.g. the footer's WhatsApp link.

**Fix — applied.** See §6. `Strict-Transport-Security`, `Referrer-Policy`,
`X-Frame-Options`, `X-Content-Type-Options` and `Permissions-Policy` are now set
for all routes. A hard `Content-Security-Policy` is left as a Recommendation
(§5) because Better Auth, Framer Motion and Sonner all emit inline styles and a
naive CSP would break sign-in.

---

### H2 — Currency was set to naira, but JBC trades in Uganda — **resolved**

**Was:** `lib/format.ts:23` (`CURRENCY = "NGN"`, locale `en-NG`) with "in naira"
copy in three more places and `+234` placeholder numbers, while the footer's real
WhatsApp number is Ugandan. Every price an admin entered would have been labelled
"₦" on the one screen where money is quoted.

**Fix — applied.** JBC confirmed the contact is Uganda (+256) and prices are in
**Ugandan shillings**. Changed:
- `lib/format.ts` → `CURRENCY = "UGX"`, `LOCALE = "en-UG"` (one constant drives
  every price on every screen).
- `lib/schemas/admin.ts` → `MAX_PRICE_NGN` → `MAX_PRICE_UGX`; error copy
  "in naira" / "Whole naira only" → Ugandan shillings / whole shillings.
- `components/ui/currency-input.tsx` → default prefix `₦` → `USh`.
- `components/admin/price-request-sheet.tsx` → "in naira" copy and `+234`
  placeholder → `+256`.
- `components/site/footer.tsx` → WhatsApp `wa.me/254…` (Kenya) → `wa.me/256…`
  (Uganda), label `+256 752 649 115`.
- `prisma/seed.ts` → `+234` placeholder → `+256`.

---

## 4. Medium Priority Issues

### M1 — No rate limiting on the API or the auth routes

Any signed-in client can hammer `POST /api/requests` and `GET /api/...` with no
throttle, and Better Auth's sign-in endpoints have no explicit rate limit
configured. The blast radius is small (writes are bounded by Zod: max 24 jars,
1000-char note; reads are cached), so this is Medium, not High.

**Fix (when the app grows):** Upstash Ratelimit is already installable alongside
the Redis client — add a sliding-window limiter keyed by `session.user.id` on the
write routes and by IP on `/api/auth/*`. Better Auth also exposes a built-in
`rateLimit` option that is off by default.

### M2 — Case-insensitive `contains` search cannot use the indexes

**Location:** `app/api/requests/route.ts:54`, `app/api/admin/requests/route.ts:60-63`,
`app/api/admin/clients/route.ts:46-47`.

`mode: "insensitive"` compiles to `ILIKE '%term%'`, which no b-tree index can
serve — every search is a sequential scan. Fine at JBC's expected row count
(hundreds to low thousands), but it degrades linearly.

**Fix (at scale):** enable `pg_trgm` and add GIN trigram indexes on
`price_requests.note` / `user.email`; or switch to prefix search.

### M3 — A revoked admin keeps their session cookie for up to 30 days

**Location:** `lib/auth.ts:40` (`expiresIn: 60*60*24*30`).

Revocation of *admin rights* is correct and immediate (`verifyAdmin` re-reads the
allowlist per request). This is about a fully signed-out-of-scope user: the
session itself lives 30 days. For a consumer app that is a reasonable choice to
avoid frequent re-login; it is recorded here so the decision is deliberate rather
than inherited.

**Fix (optional):** the client-side `router.refresh()` after pricing already
re-checks access. Shortening `expiresIn` to 7–14 days costs little re-login.

### M4 — Social share images were blocked by the auth proxy — **fixed**

**Location:** `proxy.ts` (static-file allowlist).

**Found by the production smoke test (§8), not by reading alone.** The generated
share images are served from extensionless routes `app/opengraph-image.tsx` /
`app/twitter-image.tsx`. The proxy's `matcher` deliberately skips anything with a
file extension (`\.\w+$`), which is why `robots.txt` and `sitemap.xml` pass — but
`/opengraph-image` has no extension, so it fell through to the session gate and
answered **307 → `/?redirect=/opengraph-image`**. Every Facebook, WhatsApp and X
link preview would have shown a blank image, which is the exact thing Phase 5's
share-image work existed to prevent.

**Fix — applied.** `/opengraph-image` and `/twitter-image` are now in the proxy's
static-file allowlist. Re-verified: both return `200 image/png`, and the
`/requests`, `/admin` and `/api` gates are unchanged.

---

## 5. Low Priority / Recommendations

- **L1 — Over-broad cache invalidation — fixed.** `invalidateTag()` now takes an
  optional scope (`lib/cache.ts`), so `POST /api/requests` and the admin pricing
  PATCH both flush only the affected client's cached lists
  (`invalidateTag(tags.requests, userId)`) instead of every client's. The admin
  queue stays unscoped — every admin's copy is stale after a write.
- **L2 — Leftover build-internal copy — fixed.** `components/site/google-sign-in-button.tsx`
  now says "Sign in is temporarily unavailable. Please try again later." instead
  of describing the build process to an end user.
- **L3 — `transition-all` in unused shadcn primitives — fixed.** The unused
  `components/ui/progress.tsx` and `components/ui/tabs.tsx` were deleted.
- **L4 — No per-block `<ErrorBoundary>`.** The app relies on the route-level
  `app/error.tsx`. Every marketing section is a static Server Component with no
  data fetching, so one crash cannot take the page down; acceptable. Add block
  boundaries when a section starts fetching.
- **L5 — `User.createdAt` has no index.** The admin clients list orders by it
  (`app/api/admin/clients/route.ts:63`). Irrelevant at hundreds of users.

**Recommendations for after launch**
- Add a real `Content-Security-Policy` (start with `frame-ancestors 'none'` and a
  report-only `script-src`), tightening over time.
- Configure Better Auth's `rateLimit` option and an Upstash limiter for writes.
- Add `pg_trgm` indexes once the request/client tables pass ~10k rows.

---

## 6. Refactored Code Examples

### H1 — security headers (`next.config.ts`)

```ts
import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
```

Applied in this pass. Re-run `pnpm build` after changing it.

---

## 7. Security Checklist

| Item | Status |
|---|---|
| Every API route requires a session or admin role | Pass |
| All POST/PATCH bodies validated with Zod before the DB | Pass |
| Client queries scoped to `session.user.id` | Pass |
| `isAdmin` not writable from any request body (`input: false`) | Pass |
| Admin revocation re-checked on every request | Pass |
| Open-redirect on `?redirect=` closed | Pass |
| Secrets gitignored (`.env*` ignored, only `.env.example` tracked) | Pass |
| No secrets or session tokens logged | Pass |
| No raw error messages shown to the visitor | Pass |
| HTTP security headers | **Fixed this pass** |
| Rate limiting | Outstanding (M1) |
| CSP | Outstanding (Recommendation) |

**Copy integrity:** no invented metrics, testimonials, logos, awards or
guarantees found. Every product claim on the landing page (`antifungal`, `works
on burns`, `most skin conditions`) is supplied by JBC in `project-description.md`,
and the footer carries the patch-test / see-a-doctor disclaimer.

**Default-nav prompt (judgment call, not a defect):** the nav is deliberately
minimal — a wordmark and a single contextual action (sign-in, or the person's
name + My requests + Admin + sign out). It is not the "4–5 centered links"
AI-default, so nothing to flag.

---

## 8. Production Smoke Test

`pnpm build` then `next start`, exercised with `curl` against the production
server. This is what surfaced M4 and confirmed the rest.

| Check | Expected | Result |
|---|---|---|
| `GET /` | 200 + landing HTML | 200, hero copy present |
| Security headers on `/` | all five present | all five present |
| `GET /requests` (signed out) | 307 → `/?redirect=/requests` | Pass |
| `GET /admin` (signed out) | 307 → `/?redirect=/admin` | Pass |
| `GET /api/requests` (signed out) | 401 JSON | Pass |
| `GET /api/admin/requests` (signed out) | 401 JSON | Pass |
| `GET /opengraph-image` | 200 `image/png` | Pass (was 307 — M4) |
| `GET /twitter-image` | 200 `image/png` | Pass (was 307 — M4) |
| `GET /robots.txt` | disallow `/admin`, `/api` | Pass |
| `GET /sitemap.xml` | landing page only | Pass |

**Still not automatable from here:** the live Google sign-in round trip (client
account → request → admin prices it → client sees the price). That needs a real
browser, the Google OAuth credentials and the deployed URL — i.e. you.

---

*Generated as the final task before deployment. Both High findings (security
headers, currency/region) and M4 (blocked share images, found by the smoke test)
fixed in the same pass.*
