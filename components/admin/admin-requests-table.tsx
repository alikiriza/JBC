"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { api } from "@/lib/api-client";
import { formatDateTime, formatPrice } from "@/lib/format";
import { useDebounce } from "@/hooks/use-debounce";
import { usePaginatedQuery, type Page } from "@/hooks/use-paginated-query";
import { StatusBadge } from "@/components/requests/status-badge";
import { PriceRequestSheet } from "@/components/admin/price-request-sheet";
import type {
  AdminRequestListItem,
  AdminRequestPage,
} from "@/lib/schemas/admin";
import { REQUEST_STATUSES } from "@/lib/schemas/price-request";

/**
 * The admin requests queue.
 *
 * ── The URL is the source of truth ─────────────────────────────────────────
 * Page, search and status filter all live in query params, so the queue can be
 * bookmarked, shared with another admin, and survives a refresh. React Query
 * reads the URL; nothing is held only in component state.
 *
 * ── Pagination is server-side ──────────────────────────────────────────────
 * `usePaginatedQuery` pages through the API's `{ data, total, page, pageSize,
 * totalPages }` envelope. Nothing is fetched in full and filtered in the
 * browser, which is what would make this fall over at a few thousand requests.
 *
 * A table on desktop, stacked cards on a phone — an admin checking requests on
 * their phone is the expected case, not an edge case, so it is not a
 * horizontally-scrolling grid.
 */

const PAGE_SIZE = 10;

/** Tab definitions. "all" is a filter value, not a status. */
const TABS = ["all", ...REQUEST_STATUSES] as const;

export function AdminRequestsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1) || 1;
  const status = searchParams.get("status") ?? "all";
  const search = searchParams.get("search") ?? "";

  // The input is uncontrolled and local; the URL is only rewritten after the
  // user stops typing, so a five-letter search is one request, not five.
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 300);

  const [active, setActive] = useState<AdminRequestListItem | null>(null);

  /** The one place URL params are written. */
  function setParams(next: { page?: number; status?: string; search?: string }) {
    const params = new URLSearchParams(searchParams.toString());

    if (next.status !== undefined) params.set("status", next.status);
    if (next.search !== undefined) {
      if (next.search) params.set("search", next.search);
      else params.delete("search");
    }
    // Any filter change resets to page 1: staying on page 4 of a result set
    // that just changed size shows an empty table with no obvious cause.
    params.set("page", String(next.page ?? 1));

    router.push(`/admin?${params.toString()}`);
  }

  // Push the debounced value into the URL once typing stops. useEffect, not
  // useState: this has to re-run when the debounced value changes.
  useEffect(() => {
    if (debouncedSearch === search) return;
    setParams({ search: debouncedSearch });
    // setParams is stable enough for this: it reads searchParams fresh on each
    // render, so re-running it would only ever write the value already in the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const query = usePaginatedQuery<AdminRequestListItem>({
    queryKey: ["admin-requests", { page, status, search }],
    queryFn: () =>
      api.get<AdminRequestPage & Page<AdminRequestListItem>>("/admin/requests", {
        params: { page, limit: PAGE_SIZE, status, search: search || undefined },
      }),
    page,
    pageSize: PAGE_SIZE,
    onPageChange: (next) => setParams({ page: next }),
  });

  return (
    <div className="flex flex-col gap-5">
      {/* ── Counts + filters ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map((tab) => {
            const selected = status === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setParams({ status: tab })}
                aria-pressed={selected}
                className={[
                  "min-h-[44px] rounded-md px-4 text-[15px] font-medium capitalize",
                  "transition-[background-color,border-color,color] duration-150",
                  selected
                    ? "border-2 border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/5 text-[color:var(--color-primary-dark)]"
                    : "border border-[color:var(--color-border)] bg-[color:var(--color-bg)] text-[color:var(--color-text-muted)] hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text)]",
                ].join(" ")}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className="relative max-w-sm">
          {/* An icon prefix inside the field, per the master_prompt's icon
              affordance list — it is a UI affordance, not the card's visual. */}
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-text-muted)]"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              // Clear immediately so an emptied box stops filtering, rather than
              // waiting out the debounce.
              if (!e.target.value) setParams({ search: "" });
            }}
            placeholder="Name, email or note"
            aria-label="Search requests"
            className="h-11 w-full rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] pl-10 pr-4 text-[15px] text-[color:var(--color-text)] transition-colors duration-150 placeholder:text-[color:var(--color-text-muted)] focus-visible:border-[color:var(--color-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-secondary)]"
          />
        </div>
      </div>

      {/* ── Results ──────────────────────────────────────────────────── */}
      {query.isLoading ? (
        <RequestsSkeleton />
      ) : query.error ? (
        <p
          role="alert"
          className="rounded-md border border-[color:var(--color-error)] bg-[color:var(--color-error-tint)] px-4 py-3 text-[15px] text-[color:var(--color-text)]"
        >
          Could not load requests. Refresh to try again.
        </p>
      ) : query.rows.length === 0 ? (
        <div className="rounded-md border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-6 py-14 text-center">
          <p className="text-[17px] font-semibold text-[color:var(--color-text)]">
            {search || status !== "all"
              ? "Nothing matches that filter"
              : "No requests yet"}
          </p>
          <p className="mx-auto mt-2 max-w-[44ch] text-[15px] leading-relaxed text-[color:var(--color-text-muted)]">
            {search || status !== "all"
              ? "Try a different search term, or switch back to All."
              : "When a client sends a price request it will appear here."}
          </p>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {query.rows.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onPrice={() => setActive(request)}
              />
            ))}
          </ul>

          <Pagination
            page={query.page}
            totalPages={query.totalPages}
            total={query.total}
            hasPrev={query.hasPrev}
            hasNext={query.hasNext}
            onPage={(next) => setParams({ page: next })}
            isFetching={query.isFetching}
          />
        </>
      )}

      <PriceRequestSheet
        request={active}
        open={active !== null}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
      />
    </div>
  );
}

/**
 * One request, as a card rather than a table row.
 *
 * A card per request at every width: the information is uneven (a note can be
 * one line or ten), and a table would either truncate the note or force a
 * horizontal scroll on a phone.
 */
function RequestCard({
  request,
  onPrice,
}: {
  request: AdminRequestListItem;
  onPrice: () => void;
}) {
  return (
    <li className="rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-4 transition-[border-color,box-shadow] duration-150 hover:border-[color:var(--color-border-strong)] hover:shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[16px] font-semibold text-[color:var(--color-text)]">
            {request.client.name || "No name given"}
          </p>
          <p className="mt-0.5 break-all text-[14px] text-[color:var(--color-text-muted)]">
            {request.client.email}
          </p>
        </div>

        <StatusBadge status={request.status} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px]">
        <span className="font-medium tabular-nums text-[color:var(--color-text)]">
          {request.quantity} × {request.size}
        </span>
        <span className="text-[color:var(--color-text-muted)]">
          Asked {formatDateTime(request.createdAt)}
        </span>

        {request.price ? (
          <span className="font-semibold tabular-nums text-[color:var(--color-primary-dark)]">
            {formatPrice(request.price)}
          </span>
        ) : null}
      </div>

      {request.note ? (
        <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-[15px] leading-relaxed text-[color:var(--color-text-muted)]">
          {request.note}
        </p>
      ) : null}

      <div className="mt-4 border-t border-[color:var(--color-border)] pt-3">
        <button
          type="button"
          onClick={onPrice}
          className="inline-flex min-h-[44px] items-center rounded-md bg-[color:var(--color-primary)] px-4 text-[15px] font-medium text-white transition-[filter,transform] duration-150 hover:brightness-95 active:scale-[0.98]"
        >
          {request.status === "Pending" ? "Set a price" : "Edit reply"}
        </button>
      </div>
    </li>
  );
}

function Pagination({
  page,
  totalPages,
  total,
  hasPrev,
  hasNext,
  onPage,
  isFetching,
}: {
  page: number;
  totalPages: number;
  total: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPage: (page: number) => void;
  isFetching: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-[color:var(--color-border)] pt-4">
      <p className="text-[14px] tabular-nums text-[color:var(--color-text-muted)]" aria-live="polite">
        Page {page} of {Math.max(totalPages, 1)} · {total} total
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={!hasPrev}
          className="inline-flex min-h-[44px] items-center rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-4 text-[15px] font-medium text-[color:var(--color-text)] transition-[background-color,border-color] duration-150 hover:bg-[color:var(--color-surface-tint)] disabled:pointer-events-none disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={!hasNext}
          className="inline-flex min-h-[44px] items-center rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-4 text-[15px] font-medium text-[color:var(--color-text)] transition-[background-color,border-color] duration-150 hover:bg-[color:var(--color-surface-tint)] disabled:pointer-events-none disabled:opacity-40"
        >
          Next
        </button>
      </div>

      {/* Dim the list while a page change is in flight, so the buttons feel
          connected to the result without blanking rows out (keepPreviousData). */}
      <p className="sr-only" aria-live="polite">
        {isFetching ? "Loading" : ""}
      </p>
    </div>
  );
}

/** Mirrors the real list's shape so nothing reflows when data arrives. */
function RequestsSkeleton() {
  return (
    <ul className="flex flex-col gap-3" aria-hidden>
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
  );
}