import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Better Auth owns every /api/auth/* route itself: the Google redirect, the
// callback, the session cookies, sign-out and CSRF. Nothing here is
// hand-written and nothing should be added — the handler is a one-liner on
// purpose.
//
// This replaced the version shipped by the JB auth block, which used the pages
// router path. JBC is App Router (VibeKit flat root layout).
export const { GET, POST } = toNextJsHandler(auth.handler);