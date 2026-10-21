import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// The landing page is public. Everything else in JBC needs a signed-in client:
// /requests and, from Phase 4, /admin.
//
// There is no /auth/sign-in in this list because JBC has no standalone sign-in
// page — the Google button lives on the landing page, so nothing beyond "/" is
// public.
const publicPaths = ["/"];

const apiAuthPrefix = "/api/auth";

/**
 * Content-Security-Policy, nonce-based.
 *
 * A per-request nonce is generated here, handed to Next.js through the
 * `x-nonce` request header (which is what makes App Router stamp it onto its
 * own inline `<script>` tags), and enforced in the response header. With
 * 'strict-dynamic', only nonce-carrying scripts and what they load may run —
 * an injected `<script src="https://evil.example">` is blocked even though it
 * is cross-origin, and an inline injection without the nonce is blocked too.
 *
 * `'self'` stays in script-src purely as a fallback for browsers that predate
 * nonce support; CSP3 browsers ignore it once 'strict-dynamic' is present.
 *
 * style-src keeps 'unsafe-inline' because both framer-motion and React set
 * style attributes at runtime, and there is no practical nonce story for
 * those. That is a deliberate, narrow exception — scripts are the injection
 * surface that matters.
 *
 * `upgrade-insecure-requests` is production-only so `next dev` on plain HTTP
 * localhost keeps working.
 */
function contentSecurityPolicy(nonce: string): string {
  const upgrade = process.env.NODE_ENV === "production" ? " upgrade-insecure-requests;" : "";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "connect-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
  ].join("; ") + `;${upgrade}`;
}

/**
 * Stamp the CSP header onto every response the proxy produces — including
 * redirects and 401s, so no path serves an unstyled-window page that a future
 * embedder could clickjack.
 */
function withCsp(req: NextRequest, res: NextResponse): NextResponse {
  const nonce = btoa(crypto.randomUUID());
  req.headers.set("x-nonce", nonce);
  res.headers.set("Content-Security-Policy", contentSecurityPolicy(nonce));
  return res;
}

/**
 * Is this one of our own API routes?
 *
 * /api/auth is excluded because it is matched and returned earlier — Better Auth
 * answers its own routes, including its own sign-in and callback.
 */
function isApi(pathname: string) {
  return pathname.startsWith("/api/");
}

/**
 * Is this path public?
 *
 * A bare prefix test is wrong here: `"/requests".startsWith("/")` is true, so a
 * plain prefix match against the root would mark the entire site public. The
 * root is matched exactly; every other entry matches itself or something nested
 * beneath it.
 */
function isPublic(pathname: string) {
  return publicPaths.some((p) => {
    if (p === "/") return pathname === "/";
    return pathname === p || pathname.startsWith(`${p}/`);
  });
}

/**
 * First line of defence only.
 *
 * This checks for the PRESENCE of a session cookie, not its validity. It cannot
 * do more than that: proxy runs on the Edge runtime, where Prisma cannot
 * run, so there is no database here to validate against.
 *
 * That is fine because it is not the real gate. Every protected page and every
 * API route calls requireSession() / auth.api.getSession() and hits the
 * database itself (master_prompt.md §MIDDLEWARE — "defence in depth"). This
 * only saves an unsigned-in visitor from rendering a page that would redirect
 * them anyway three lines later.
 */
export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Better Auth handles its own routes, including its own auth.
  if (pathname.startsWith(apiAuthPrefix)) {
    return withCsp(req, NextResponse.next({ request: { headers: req.headers } }));
  }

  if (isPublic(pathname)) {
    return withCsp(req, NextResponse.next({ request: { headers: req.headers } }));
  }

  // Static files and Next.js internals.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/illustrations") ||
    // Generated social-share images (app/opengraph-image.tsx,
    // app/twitter-image.tsx). These carry no file extension, so the matcher
    // below does not skip them — without this they would hit the session gate
    // and answer a crawler with a 307 to the landing page instead of the PNG,
    // leaving every Facebook / WhatsApp / X link preview blank.
    pathname === "/opengraph-image" ||
    pathname === "/twitter-image"
  ) {
    return withCsp(req, NextResponse.next({ request: { headers: req.headers } }));
  }

  const sessionCookie = getSessionCookie(req);

  if (!sessionCookie) {
    // An API route gets a JSON 401, never a redirect. A fetch() would follow a
    // 307, land on the HTML landing page, and then fail trying to parse it as
    // JSON — turning "you are signed out" into a baffling parse error. The route
    // handlers would have answered 401 on their own via requireSession(); this
    // just gets there without rendering a page first.
    if (isApi(pathname)) {
      return withCsp(
        req,
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      );
    }

    // A page gets sent to the landing page, which is where the Google button is.
    // `redirect` is kept so we can return them to where they were headed.
    const signInUrl = new URL("/", req.url);
    signInUrl.searchParams.set("redirect", pathname);
    return withCsp(req, NextResponse.redirect(signInUrl));
  }

  return withCsp(req, NextResponse.next({ request: { headers: req.headers } }));
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};