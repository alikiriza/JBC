import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { verifyAdmin } from "@/lib/admin";
import { Wordmark } from "@/components/site/wordmark";

/**
 * The admin shell.
 *
 * ── This is the gate that matters ──────────────────────────────────────────
 * Two checks, both of which have to pass:
 *
 *   1. `user.isAdmin` on the database row — what requireRole("admin") uses on
 *      the API routes.
 *   2. `verifyAdmin()` in lib/admin.ts, which re-reads the ADMIN_EMAILS
 *      allowlist. This is the one that makes revocation instant: remove an
 *      address from ADMIN_EMAILS and the very next request is refused, with no
 *      migration and no manual row edit.
 *
 * A layout, not a check repeated in each page, because layouts do not re-render
 * on client-side navigation between sibling routes. Put this in the pages and
 * moving from /admin to /admin/clients would skip it.
 *
 * Anyone who fails is sent to the landing page rather than shown a 403. A 403
 * confirms the panel exists; the landing page does not. The nav only renders an
 * admin link for a session that passes this same check, so a non-admin is never
 * shown a door they cannot open.
 */
export const metadata: Metadata = {
  title: "Admin — JBC Skin Cream",
  // Admin pages hold client names, emails and health notes. Keep them out of
  // search results even if the domain ever goes public.
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let allowed = false;

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session) allowed = await verifyAdmin(session.user.id);
  } catch {
    // Database unreachable or env not filled in yet. Refuse rather than guess —
    // the safe direction to fail in is the closed one.
    allowed = false;
  }

  if (!allowed) redirect("/");

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-[color:var(--color-surface-tint)]">
      <div className="border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
        <div className="mx-auto flex w-full max-w-[var(--container-page)] flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Wordmark />
            <p className="mt-0.5 text-[14px] text-[color:var(--color-text-muted)]">
              Admin
            </p>
          </div>

          {/* Two destinations, so this is a nav rather than a single link. */}
          <nav aria-label="Admin sections" className="flex items-center gap-2">
            <AdminTab href="/admin">Requests</AdminTab>
            <AdminTab href="/admin/clients">Clients</AdminTab>
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center rounded-md px-3 text-[15px] font-medium text-[color:var(--color-text-muted)] transition-colors duration-150 hover:text-[color:var(--color-text)]"
            >
              View site
            </Link>
          </nav>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[var(--container-page)] px-5 py-8 sm:py-10">
        {children}
      </div>
    </div>
  );
}

/**
 * Dashboard nav uses `rounded-md` inside admin screens and the marketing pages
 * use `rounded-full` — master_prompt.md §Buttons: never both on one screen.
 */
function AdminTab({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-[44px] items-center rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-4 text-[15px] font-medium text-[color:var(--color-text)] transition-[background-color,border-color] duration-150 hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-surface-tint)]"
    >
      {children}
    </Link>
  );
}