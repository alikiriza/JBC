import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * §Components: "Buttons: pill-shaped; primary is green with white text,
 * call to action is yellow with charcoal text."
 * §Accessibility: tap targets at least 44px.
 */
type Variant = "primary" | "cta" | "outline";
type Size = "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-primary-dark)]",
  // §Colors: yellow button text is always charcoal, never yellow-on-white
  cta: "bg-[color:var(--color-accent)] text-[color:var(--color-text)] hover:brightness-[0.97]",
  outline:
    "border border-[color:var(--color-border-strong)] bg-transparent text-[color:var(--color-text)] hover:bg-[color:var(--color-primary-tint)] hover:border-[color:var(--color-primary)]",
};

const SIZES: Record<Size, string> = {
  md: "min-h-[44px] px-5 text-[15px]",
  lg: "min-h-[52px] px-7 text-[16px]",
};

export function ButtonLink({
  href,
  className,
  variant = "primary",
  size = "md",
  children,
}: {
  href: string;
  className?: string;
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium",
        "transition-[background-color,border-color,color,filter,transform] duration-150",
        "active:scale-[0.98]",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      {children}
    </Link>
  );
}