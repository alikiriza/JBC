"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { api } from "@/lib/api-client";
import { formatCount, formatDate } from "@/lib/format";
import { useDebounce } from "@/hooks/use-debounce";
import { usePaginatedQuery, type Page } from "@/hooks/use-paginated-query";
import type { AdminClientListItem, AdminClientPage } from "@/lib/schemas/admin";

/**
 * The admin clients list — everyone who has signed in with Google.
 *
 * Name, email and sign-up date, which is exactly what
 * project-description.md asks this page for, plus a request count so an admin can
 * tell a one-off enquirer from someone who has asked six times.
 *
 * The counts come from the server (a `_count` aggregate in the route), not from
 * counting rows in the browser: only one page of clients is loaded at a time, so
 * counting locally would report zero for anyone not on this page.
 */

const PAGE_SIZE = 20;

export function AdminClientsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1) || 1;
  const search = searchParams.get("search") ?? "";

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 300);

  function setParams(next: { page?: number; search?: string }) {
    const params = new URLSearchParams(searchParams.toString());

    if (next.search !== undefined) {
      if (next.search) params.set("search", next.search);
      else params.delete("search");
    }
    params.set("page", String(next.page ?? 1));

    router.push(`/admin/clients?${params.toString()}`);
  }

  useEffect(() => {
    if (debouncedSearch === search) return;
    setParams({ search: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const query = usePaginatedQuery<AdminClientListItem>({
    queryKey: ["admin-clients", { page, search }],
    queryFn: () =>
      api.get<AdminClientPage & Page<AdminClientListItem>>("/admin/clients", {
        params: { page, limit: PAGE_SIZE, search: search || undefined },
      }),
    page,
    pageSize: PAGE_SIZE,
    onPageChange: (next) => setParams({ page: next }),
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="relative max-w-sm">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-text-muted)]"
        />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            if (!e.target.value) setParams({ search: "" });
          }}
          placeholder="Name or email"
          aria-label="Search clients"
          className="h-11 w-full rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] pl-10 pr-4 text-[15px] text-[color:var(--color-text)] transition-colors duration-150 placeholder:text-[color:var(--color-text-muted)] focus-visible:border-[color:var(--color-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-secondary)]"
        />
      </div>

      {query.isLoading ? (
        <ul className="flex flex-col gap-3" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <li
              key={i}
              className="animate-pulse rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-4"
            >
              <div className="h-4 w-44 rounded bg-[color:var(--color-surface-tint)]" />
              <div className="mt-2.5 h-3 w-64 rounded bg-[color:var(--color-surface-tint)]" />
            </li>
          ))}
        </ul>
      ) : query.error ? (
        <p
          role="alert"
          className="rounded-md border border-[color:var(--color-error)] bg-[color:var(--color-error-tint)] px-4 py-3 text-[15px] text-[color:var(--color-text)]"
        >
          Could not load clients. Refresh to try again.
        </p>
      ) : query.rows.length === 0 ? (
        <div className="rounded-md border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-6 py-14 text-center">
          <p className="text-[17px] font-semibold text-[color:var(--color-text)]">
            {search ? "Nobody matches that search" : "No clients yet"}
          </p>
          <p className="mx-auto mt-2 max-w-[44ch] text-[15px] leading-relaxed text-[color:var(--color-text-muted)]">
            {search
              ? "Try part of an email address instead."
              : "Clients appear here the first time they sign in with Google."}
          </p>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {query.rows.map((client) => (
              <li
                key={client.id}
                className="rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[16px] font-semibold text-[color:var(--color-text)]">
                      {client.name || "No name given"}
                    </p>
                    <p className="mt-0.5 break-all text-[14px] text-[color:var(--color-text-muted)]">
                      {client.email}
                    </p>
                  </div>

                  <p className="shrink-0 text-[14px] tabular-nums text-[color:var(--color-text-muted)]">
                    {formatCount(client.requestCount)}{" "}
                    {client.requestCount === 1 ? "request" : "requests"}
                  </p>
                </div>

                <p className="mt-3 text-[14px] tabular-nums text-[color:var(--color-text-muted)]">
                  Signed up {formatDate(client.createdAt)}
                  {client.lastRequestAt
                    ? ` · last asked ${formatDate(client.lastRequestAt)}`
                    : ""}
                </p>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between gap-4 border-t border-[color:var(--color-border)] pt-4">
            <p className="text-[14px] tabular-nums text-[color:var(--color-text-muted)]" aria-live="polite">
              Page {query.page} of {Math.max(query.totalPages, 1)} · {query.total} total
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setParams({ page: query.page - 1 })}
                disabled={!query.hasPrev}
                className="inline-flex min-h-[44px] items-center rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-4 text-[15px] font-medium text-[color:var(--color-text)] transition-[background-color,border-color] duration-150 hover:bg-[color:var(--color-surface-tint)] disabled:pointer-events-none disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setParams({ page: query.page + 1 })}
                disabled={!query.hasNext}
                className="inline-flex min-h-[44px] items-center rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-4 text-[15px] font-medium text-[color:var(--color-text)] transition-[background-color,border-color] duration-150 hover:bg-[color:var(--color-surface-tint)] disabled:pointer-events-none disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}