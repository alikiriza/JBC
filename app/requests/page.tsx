import type { Metadata } from "next";
import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { RequestsList } from "@/components/requests/requests-list";
import { RequestsListSkeleton } from "@/components/requests/requests-list-skeleton";

/**
 * "My requests" — a client's own price requests.
 *
 * Protected twice on purpose (master_prompt.md §MIDDLEWARE): the middleware
 * keeps unsigned-in visitors out before this file renders, and this page
 * re-checks the session itself. The middleware only tests for the presence of a
 * cookie — it cannot query the database on the Edge runtime — so the check below
 * is the one that actually decides.
 *
 * This page fetches nothing. It verifies the session, renders the heading, and
 * hands the list to React Query, which reads the API route. Every row the client
 * sees has passed through `clientId: session.user.id` in app/api/requests — there
 * is no code path on this page that can reach another person's rows.
 */

export const metadata: Metadata = {
  title: "My requests — JBC Skin Cream",
  description: "Every price you have asked for, and our reply.",
};

export default async function RequestsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/");

  return (
    <div className="bg-[color:var(--color-bg)]">
      <div className="mx-auto w-full max-w-[var(--container-page)] px-5 py-16 sm:py-20">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[30px] font-bold text-[color:var(--color-primary-dark)] sm:text-[36px]">
              My requests
            </h1>
            <p className="mt-3 max-w-[56ch] text-[16px] leading-relaxed text-[color:var(--color-text-muted)]">
              Every price you have asked for, newest first. Only you can see
              this.
            </p>
          </div>

          <Link
            href="/requests/new"
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-[color:var(--color-primary)] px-6 text-[15px] font-medium text-white transition-[filter,transform] duration-150 hover:brightness-95 active:scale-[0.98]"
          >
            Ask for a price
          </Link>
        </div>

        {/* The list reads the URL, so it needs a Suspense boundary or Next will
            refuse to prerender the route. The fallback mirrors the real list's
            shape — three rows, then a footer — so nothing reflows on arrival. */}
        <Suspense fallback={<RequestsListSkeleton />}>
          <RequestsList />
        </Suspense>
      </div>
    </div>
  );
}