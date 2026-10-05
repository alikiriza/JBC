"use client";

import Link from "next/link";
import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { usePaginatedQuery } from "@/hooks/use-paginated-query";
import { useDebounce } from "@/hooks/use-debounce";
import { api } from "@/lib/api-client";
import { formatDate, formatPrice } from "@/lib/format";
import type { PriceRequestPage } from "@/lib/schemas/price-request";
import { StatusBadge } from "@/components/requests/status-badge";
import { RequestCardSkeleton } from "@/components/requests/requests-list-skeleton";
import { JarEmptyIllustration } from "@/components/illustrations";

/**
 * "My requests" — the client's own price requests.
 *
 * ── The URL is the source of truth ───────────────────────────────────────
 * Page and search live in the query string, not in React state. A client can
 * bookmark "page 2 of my pending requests", share the link with themselves
 * across devices, and the browser's back button steps through their own
 * history correctly. Nothing is hidden in state that a refresh would lose.
 *
 * ── Pagination happens in the database, not in the browser ────────────────
 * The API takes `page` and `limit` and returns one page plus the totals. The
 * full list is never loaded and then sliced — that pattern is what makes a list
 * fall over once there are a few thousand rows.
 *
 * ── Prices ───────────────────────────────────────────────────────────────
 * Each row's price is the one an admin set on THAT row. There is no endpoint
 * anywhere that returns a price without first proving who is asking, so a price
 * can never leak onto a public page or another client's screen.
 */

const PAGE_SIZE = 10;

export function RequestsList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const search = searchParams.get("search") ?? "";

  // Wait for a pause in typing before asking the database. Without this every
  // keystroke would be a query and a Redis key.
  const debouncedSearch = useDebounce(search, 300);

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) params.set(key, value);
      else params.delete(key);

      // Any filter change resets to page 1. Staying on page 4 of a list that
      // now has one page shows an empty screen and reads as "you have nothing".
      if (key === "search") params.delete("page");

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const { rows, total, totalPages, isLoading, isFetching, error } =
    usePaginatedQuery({
      queryKey: ["requests", { page, search: debouncedSearch }],
      queryFn: () =>
        api.get<PriceRequestPage>("/requests", {
          params: { page, limit: PAGE_SIZE, search: debouncedSearch || undefined },
        }),
      page,
      pageSize: PAGE_SIZE,
      onPageChange: (next) => setParam("page", next === 1 ? "" : String(next)),
    });

  const showSkeleton = isLoading;
  const showNoResults = !isLoading && !error && rows.length === 0;
  const isFiltered = debouncedSearch.length > 0;

  return (
    <div className="mt-10">
      {/* ── Search ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-[320px]">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--color-text-muted)]"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setParam("search", e.target.value)}
            placeholder="Search your notes"
            aria-label="Search your requests by note"
            className="min-h-[44px] w-full rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] pl-11 pr-11 text-[16px] text-[color:var(--color-text)] transition-colors duration-150 placeholder:text-[color:var(--color-text-muted)] focus-visible:border-[color:var(--color-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-secondary)]"
          />
          {/* Clear button only when there is something to clear. */}
          {search ? (
            <button
              type="button"
              onClick={() => setParam("search", "")}
              aria-label="Clear search"
              className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-[color:var(--color-text-muted)] transition-colors duration-150 hover:bg-[color:var(--color-surface-tint)] hover:text-[color:var(--color-text)]"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
        </div>

        {/* A quiet "refreshing" hint rather than a spinner over the list. The
            old page stays on screen while the next one loads, so the list never
            blanks out under the reader. */}
        <p
          aria-live="polite"
          className="text-[14px] text-[color:var(--color-text-muted)]"
        >
          {isFetching && !isLoading ? "Updating…" : null}
          {!isLoading && !error ? (
            <>
              {total} {total === 1 ? "request" : "requests"}
            </>
          ) : null}
        </p>
      </div>

      {/* ── List ────────────────────────────────────────────────────── */}
      {showSkeleton ? (
        <ul className="mt-6 grid gap-4" aria-busy="true">
          <li className="sr-only">Loading your requests</li>
          {Array.from({ length: 3 }).map((_, i) => (
            <RequestCardSkeleton key={i} />
          ))}
        </ul>
      ) : error ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-[color:var(--color-error)] bg-[color:var(--color-error-tint)] p-6"
        >
          <p className="text-[16px] font-semibold text-[color:var(--color-error)]">
            We could not load your requests
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-[color:var(--color-text)]">
            Please try again in a moment.
          </p>
        </div>
      ) : showNoResults ? (
        /* Two genuinely different empty states. "You have asked for nothing"
           and "nothing matched your search" need different words and different
           actions — conflating them is how people end up thinking their request
           was lost. */
        <div className="mt-6 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-tint)] p-8 text-center sm:p-12">
          <JarEmptyIllustration className="mx-auto h-auto w-[130px]" />

          {isFiltered ? (
            <>
              <h2 className="mt-6 text-[20px] font-semibold text-[color:var(--color-text)]">
                Nothing matched &ldquo;{debouncedSearch}&rdquo;
              </h2>
              <p className="mx-auto mt-2 max-w-[42ch] text-[15px] leading-relaxed text-[color:var(--color-text-muted)]">
                Search looks at the notes you wrote. Try a different word, or
                clear the search to see everything.
              </p>
              <button
                type="button"
                onClick={() => setParam("search", "")}
                className="mt-6 inline-flex min-h-[44px] items-center rounded-full border border-[color:var(--color-border-strong)] px-5 text-[15px] font-medium text-[color:var(--color-text)] transition-colors duration-150 hover:bg-[color:var(--color-bg)]"
              >
                Clear search
              </button>
            </>
          ) : (
            <>
              <h2 className="mt-6 text-[20px] font-semibold text-[color:var(--color-text)]">
                No requests yet
              </h2>
              <p className="mx-auto mt-2 max-w-[42ch] text-[15px] leading-relaxed text-[color:var(--color-text-muted)]">
                When you ask for a price it will appear here, along with our
                reply once we have set it.
              </p>
              <Link
                href="/requests/new"
                className="mt-6 inline-flex min-h-[44px] items-center rounded-full bg-[color:var(--color-primary)] px-6 text-[15px] font-medium text-white transition-[filter,transform] duration-150 hover:brightness-95 active:scale-[0.98]"
              >
                Ask for a price
              </Link>
            </>
          )}
        </div>
      ) : (
        <ul className="mt-6 grid gap-4">
          {rows.map((request) => {
            const priced = request.price !== null;

            return (
              <li
                key={request.id}
                className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-5 shadow-sm transition-[border-color,box-shadow] duration-150 hover:border-[color:var(--color-border-strong)] sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[16px] font-semibold text-[color:var(--color-text)]">
                      {request.size} &times; {request.quantity}
                      <span className="ml-2 font-normal text-[color:var(--color-text-muted)]">
                        {request.quantity === 1 ? "jar" : "jars"}
                      </span>
                    </p>
                    <p className="mt-1 text-[14px] text-[color:var(--color-text-muted)]">
                      Asked on {formatDate(request.createdAt)}
                    </p>
                  </div>

                  <StatusBadge status={request.status} />
                </div>

                {request.note ? (
                  <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-[color:var(--color-text)]">
                    {request.note}
                  </p>
                ) : null}

                {/* The price block. Pending rows show what is still to happen
                    instead of a blank space, so a Pending request never looks
                    like a failed one. */}
                {priced ? (
                  <div className="mt-5 rounded-lg border border-[color:var(--color-primary)] bg-[color:var(--color-primary-tint)] p-4">
                    <p className="text-[13px] font-medium uppercase tracking-wide text-[color:var(--color-primary-dark)]">
                      Your price
                    </p>
                    <p className="mt-1 text-[28px] font-bold tabular-nums text-[color:var(--color-primary-dark)]">
                      {formatPrice(request.price)}
                    </p>

                    {request.adminNote ? (
                      <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-[color:var(--color-text)]">
                        {request.adminNote}
                      </p>
                    ) : null}

                    {request.contactMethod ? (
                      <p className="mt-3 text-[15px] text-[color:var(--color-text)]">
                        To go ahead, reach us on{" "}
                        <span className="font-medium">
                          {request.contactMethod}
                        </span>
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-5 rounded-lg bg-[color:var(--color-surface-tint)] px-4 py-3 text-[15px] leading-relaxed text-[color:var(--color-text-muted)]">
                    We have your request. Your price will appear here once we
                    have replied.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* ── Pagination ──────────────────────────────────────────────── */}
      {!isLoading && !error && totalPages > 1 ? (
        <nav
          aria-label="Request pages"
          className="mt-8 flex items-center justify-between gap-4 border-t border-[color:var(--color-border)] pt-6"
        >
          <button
            type="button"
            onClick={() =>
              setParam("page", page <= 2 ? "" : String(page - 1))
            }
            disabled={page <= 1}
            className="inline-flex min-h-[44px] items-center rounded-full border border-[color:var(--color-border-strong)] px-5 text-[15px] font-medium text-[color:var(--color-text)] transition-colors duration-150 hover:bg-[color:var(--color-surface-tint)] disabled:pointer-events-none disabled:opacity-40"
          >
            Previous
          </button>

          <p className="text-[15px] tabular-nums text-[color:var(--color-text-muted)]">
            Page {page} of {totalPages}
          </p>

          <button
            type="button"
            onClick={() => setParam("page", String(page + 1))}
            disabled={page >= totalPages}
            className="inline-flex min-h-[44px] items-center rounded-full border border-[color:var(--color-border-strong)] px-5 text-[15px] font-medium text-[color:var(--color-text)] transition-colors duration-150 hover:bg-[color:var(--color-surface-tint)] disabled:pointer-events-none disabled:opacity-40"
          >
            Next
          </button>
        </nav>
      ) : null}
    </div>
  );
}