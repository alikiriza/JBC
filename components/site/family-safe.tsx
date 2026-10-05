import { FamilyIllustration } from "@/components/illustrations";

/**
 * "Safe for everyone" — a blue band per design-style-guide.md §Colors:
 * "blue for links, info cards and trust badges".
 */
export function FamilySafe() {
  return (
    <section id="safe-for-everyone" className="bg-[color:var(--color-secondary)]">
      <div className="mx-auto w-full max-w-[var(--container-page)] px-5 py-20 sm:py-24">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_0.9fr] md:gap-14">
          <div>
            {/* White badge with blue text, not white-on-translucent: 13px white
                text over a 15% white wash on blue only reaches 3.96:1, which
                fails WCAG AA. Blue on solid white reaches 5.2:1. */}
            <span className="inline-flex items-center rounded-full bg-[color:var(--color-bg)] px-3 py-1 text-[13px] font-medium text-[color:var(--color-secondary)]">
              Safe for the whole family
            </span>

            <h2 className="mt-5 max-w-[18ch] text-[30px] font-bold text-white sm:text-[36px]">
              Safe for children, men and women
            </h2>

            <p className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-[color:var(--color-secondary-tint)]">
              One cream for the whole household. Children, men and women can
              all use JBC. Do a small patch test before wider use, and see a
              doctor for severe burns or a condition that does not improve.
            </p>
          </div>

          <div className="mx-auto w-full max-w-[280px] md:max-w-none">
            <FamilyIllustration className="h-auto w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}