import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Every API route handler calls one of these before touching the database.
 * Never ship an unauthenticated route handler.
 */
export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { session, error: null };
}

/**
 * Admin gate.
 *
 * The role comes from `user.isAdmin` on the database row, which is never
 * writable by the client — `input: false` in lib/auth.ts stops Better Auth
 * accepting it from a request body, and the value is only ever set by our own
 * code from the ADMIN_EMAILS allowlist.
 *
 * ADMIN_EMAILS is checked as a second, independent gate in
 * lib/admin.ts, so revoking admin is a one-line env change even for people
 * already signed in.
 */
export async function requireRole(role: string | string[]) {
  const { session, error } = await requireSession();

  if (error) return { session: null, error };

  const allowed = Array.isArray(role) ? role : [role];

  // JBC has exactly one role beyond "client", so the `role` argument is
  // currently always "admin". Kept general so it matches the master_prompt
  // shape and does not need rewriting if a second role appears.
  const userRole = session.user.isAdmin ? "admin" : null;

  if (!userRole || !allowed.includes(userRole)) {
    return {
      session: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { session, error: null };
}