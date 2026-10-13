import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The wordmark: the JBC logo mark plus the name.
 *
 * The mark is a real asset (`public/logo.svg`) rather than a letter in a
 * circle. `next/image` is used with `unoptimized` because the source is already
 * a resolution-independent SVG — running it through the raster optimizer would
 * add cost and change nothing.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        // min-h-11 keeps the logo a 44px tap target per §Accessibility
        "inline-flex min-h-[44px] items-center gap-2 rounded-sm",
        className,
      )}
      aria-label="JBC home"
    >
      <Image
        src="/logo.svg"
        alt=""
        aria-hidden="true"
        width={32}
        height={32}
        unoptimized
        className="h-8 w-8 shrink-0 rounded-full"
      />
      <span className="font-heading text-[20px] font-bold tracking-[-0.02em]">
        JBC
      </span>
    </Link>
  );
}
