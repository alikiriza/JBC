import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The wordmark. A text logo, not a graphic one: the real JBC logo is a
 * Phase 5 item (see project-description.md → Open Items).
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        // min-h-11 keeps the logo a 44px tap target per §Accessibility,
        // even though the visible mark is only 32px tall.
        "inline-flex min-h-[44px] items-center gap-2 rounded-sm font-heading text-[20px] font-bold tracking-[-0.02em]",
        className,
      )}
    >
      <span
        aria-hidden
        className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-[15px] text-white"
      >
        J
      </span>
      JBC
    </Link>
  );
}