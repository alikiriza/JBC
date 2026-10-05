import { db } from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";

/**
 * Keeping `user.isAdmin` in step with the ADMIN_EMAILS allowlist.
 *
 * ── Why this is its own file ────────────────────────────────────────────────
 * lib/admin.ts imports `auth` (for isCurrentUserAdmin), and lib/auth.ts needs
 * this function to drive its sign-in hook. If this lived in lib/admin.ts the two
 * modules would import each other, and the resulting cycle would depend on
 * module-evaluation order to hand back a defined binding. This file imports only
 * the database and the pure allowlist reader, so lib/auth.ts can depend on it
 * with no cycle at all.
 */

/**
 * Called from Better Auth's session-create hook so a newly added admin does not
 * have to wait for a manual SQL update, and a removed admin loses the flag the
 * next time they sign in. Idempotent: it writes only when the value actually
 * differs, so a returning admin does not cause a write on every sign-in.
 */
export async function syncAdminFlag(userId: string, email: string) {
  const shouldBeAdmin = isAdminEmail(email);

  const current = await db.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });

  if (!current || current.isAdmin === shouldBeAdmin) return;

  await db.user.update({
    where: { id: userId },
    data: { isAdmin: shouldBeAdmin },
  });
}