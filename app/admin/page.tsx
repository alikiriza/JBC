import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminRequestsTable } from "@/components/admin/admin-requests-table";

/**
 * /admin — the requests queue.
 *
 * A Server Component that fetches nothing. It renders the heading and hands the
 * queue to React Query, which reads the API route. Every row on screen came back
 * from a route gated by requireRole("admin") behind verifyAdmin()'s ADMIN_EMAILS
 * re-check, and the layout guards the page itself.
 *
 * The table reads the URL, so it needs a Suspense boundary or Next refuses to
 * prerender the route.
 *
 * Dashboard type scale, not marketing: 30px here against the landing page's much
 * larger headlines. Never mix the two scales on one screen.
 */

export const metadata: Metadata = {
  title: "Requests — Admin",
  description: "Every price request, with the client it belongs to.",
};

export default function AdminRequestsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[30px] font-bold text-[color:var(--color-primary-dark)]">
          Requests
        </h1>
        <p className="mt-2 max-w-[60ch] text-[16px] leading-relaxed text-[color:var(--color-text-muted)]">
          Set a price and a reply note. The client sees it on their own requests
          page — nobody else can.
        </p>
      </div>

      <Suspense fallback={<QueueSkeleton />}>
        <AdminRequestsTable />
      </Suspense>
    </div>
  );
}

/** Same shape as the real queue's loading state, so nothing jumps on arrival. */
function QueueSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-hidden>
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-11 w-24 animate-pulse rounded-md bg-[color:var(--color-bg)]"
          />
        ))}
      </div>
      <ul className="flex flex-col gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <li
            key={i}
            className="animate-pulse rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-4 sm:p-5"
          >
            <div className="h-4 w-40 rounded bg-[color:var(--color-surface-tint)]" />
            <div className="mt-2.5 h-3 w-56 rounded bg-[color:var(--color-surface-tint)]" />
            <div className="mt-4 h-3 w-32 rounded bg-[color:var(--color-surface-tint)]" />
          </li>
        ))}
      </ul>
    </div>
  );
}