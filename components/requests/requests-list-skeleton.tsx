import { Skeleton } from "@/components/ui/skeleton";

/**
 * One request card, greyed out.
 *
 * Shared by the Suspense fallback and by the in-place loading state inside the
 * list, so the two are pixel-identical and a refetch cannot shift the page.
 */
export function RequestCardSkeleton() {
  return (
    <li className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-2/3" />
    </li>
  );
}

/**
 * The Suspense fallback for the requests list.
 *
 * A skeleton, never a spinner: master_prompt.md is explicit that page data
 * loads behind a skeleton, and a spinner that replaces the whole list reads as a
 * slower site than three grey rows that arrive instantly.
 *
 * Shaped like the real thing — a search bar, three request cards, then a page
 * footer — so content does not jump when the data lands (CLS).
 */
export function RequestsListSkeleton() {
  return (
    <div className="mt-10" aria-busy="true">
      <p className="sr-only">Loading your requests</p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-11 w-full rounded-md sm:w-[320px]" />
        <Skeleton className="h-4 w-24" />
      </div>

      <ul className="mt-6 grid gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <RequestCardSkeleton key={i} />
        ))}
      </ul>

      <div className="mt-8 flex items-center justify-between gap-4 border-t border-[color:var(--color-border)] pt-6">
        <Skeleton className="h-11 w-28 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-11 w-28 rounded-full" />
      </div>
    </div>
  );
}