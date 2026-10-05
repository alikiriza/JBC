import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * JBC's admin allowlist.
 *
 * There are two gates, deliberately:
 *
 *   1. `user.isAdmin` on the database row — the fast check, already loaded by
 *      the session, used on every request.
 *   2. ADMIN_EMAILS here — the source of truth, re-checked on every admin
 *      action.
 *
 * The second gate is what makes removing access instant. If someone is removed
 * from ADMIN_EMAILS they lose admin on their very next request, without a
 * migration or a manual row update. Only the first gate would leave them in
 * until the row was changed by hand.
 */

/** Emails allowed to be admins. Blank/unset means nobody is an admin. */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.trim().toLowerCase());
}

/**
 * True only if the signed-in user passes BOTH gates.
 *
 * Used by requireRole in lib/auth-guard.ts, so a stale isAdmin=true row cannot
 * outlive the env change that revoked it.
 */
export async function verifyAdmin(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true, email: true },
  });

  if (!user?.isAdmin) return false;

  return isAdminEmail(user.email);
}

/**
 * `syncAdminFlag` lives in lib/admin-flag.ts, not here, because lib/auth.ts
 * calls it on every sign-in and this file imports `auth`. It is re-exported so
 * there is still one obvious import site for admin helpers.
 */
export { syncAdminFlag } from "@/lib/admin-flag";

/** True when the current browser session belongs to an admin. */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return false;
  return verifyAdmin(session.user.id);
}