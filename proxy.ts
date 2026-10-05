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
  if (pathname.startsWith(apiAuthPrefix)) return NextResponse.next();

  if (isPublic(pathname)) return NextResponse.next();

  // Static files and Next.js internals.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/illustrations")
  ) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(req);

  if (!sessionCookie) {
    // Send them to the landing page, which is where the Google button is.
    // `redirect` is kept so Phase 3 can return them to where they were headed.
    const signInUrl = new URL("/", req.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};