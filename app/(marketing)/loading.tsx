import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state shaped like the hero and first section, so the page does
 * not jump when real content arrives. Never a spinner for page data.
 */
export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <section className="bg-[color:var(--color-primary-dark)]">
        <div className="mx-auto w-full max-w-[var(--container-page)] px-5 py-16 sm:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <Skeleton className="h-10 w-full max-w-[420px] rounded-md bg-white/15" />
              <Skeleton className="mt-3 h-10 w-3/4 max-w-[320px] rounded-md bg-white/15" />
              <Skeleton className="mt-6 h-5 w-full max-w-[440px] rounded-md bg-white/10" />
              <Skeleton className="mt-2 h-5 w-2/3 max-w-[300px] rounded-md bg-white/10" />
              <Skeleton className="mt-8 h-[52px] w-[210px] rounded-full bg-white/20" />
            </div>
            <Skeleton className="mx-auto h-auto w-full max-w-[320px] aspect-square rounded-lg bg-white/10" />
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[var(--container-page)] px-5 py-20">
        <Skeleton className="h-9 w-2/3 max-w-[360px] rounded-md" />
        <div className="mt-10 grid gap-5 sm:gap-6 lg:grid-cols-6">
          {["lg:col-span-3", "lg:col-span-3", "lg:col-span-2", "lg:col-span-4"].map(
            (span, index) => (
              <div
                key={index}
                className={`rounded-lg border border-[color:var(--color-border)] p-6 ${span}`}
              >
                <Skeleton className="aspect-[16/9] w-full rounded-md" />
                <Skeleton className="mt-5 h-5 w-1/2 rounded-md" />
                <Skeleton className="mt-3 h-4 w-full rounded-md" />
                <Skeleton className="mt-2 h-4 w-4/5 rounded-md" />
              </div>
            ),
          )}
        </div>
      </div>

      <span className="sr-only">Loading the JBC page</span>
    </div>
  );
}