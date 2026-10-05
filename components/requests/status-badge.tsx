import { REQUEST_STATUSES, type RequestStatus } from "@/lib/schemas/price-request";

/**
 * A request's status, as a pill.
 *
 * §Components: Pending = yellow tint, Priced = green tint, Closed = grey.
 *
 * The status word is always rendered. §Accessibility forbids relying on colour
 * alone, and here it matters twice over — the three states are tints of yellow,
 * green and grey, which a red-green colour-blind reader has to be told about.
 * The word is the signal; the tint is only reinforcement.
 */

const STYLES: Record<RequestStatus, string> = {
  Pending:
    "bg-[color:var(--color-accent-tint)] text-[color:var(--color-text)] border-[color:var(--color-accent)]",
  Priced:
    "bg-[color:var(--color-primary-tint)] text-[color:var(--color-primary-dark)] border-[color:var(--color-primary)]",
  Closed:
    "bg-[color:var(--color-surface-tint)] text-[color:var(--color-text-muted)] border-[color:var(--color-border-strong)]",
};

export function StatusBadge({ status }: { status: string }) {
  // Anything unexpected renders as Closed rather than crashing the list. The
  // database default is Pending, so an unknown value means something wrote a
  // status this build does not know about.
  const known = (REQUEST_STATUSES as readonly string[]).includes(status);
  const key = known ? (status as RequestStatus) : "Closed";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[13px] font-medium ${
        STYLES[key]
      }`}
    >
      {status}
    </span>
  );
}