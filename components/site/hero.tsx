import { HeroJar } from "@/components/illustrations";
import { GetAPriceCta } from "@/components/site/get-a-price-cta";

/**
 * Hero. Green background per design-style-guide.md §Landing Page Sections.
 *
 * The yellow sign-in button is the single focal point, so nothing else on
 * screen competes with it: one headline, one short paragraph, one button.
 */
export function Hero() {
  return (
    <section className="bg-[color:var(--color-primary-dark)]">
      <div className="mx-auto w-full max-w-[var(--container-page)] px-5 py-16 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h1 className="text-[36px] leading-[1.05] font-bold text-white sm:text-[48px] lg:text-[56px]">
              Natural healing for the whole family
            </h1>

            <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-[color:var(--color-primary-tint)]">
              JBC is an all-natural herbal skin cream made from herbs with no
              artificial additives. It is antifungal, it works on burns, and it
              is safe for children, men and women.
            </p>

            <GetAPriceCta className="mt-8" />

            <p className="mt-4 text-[14px] text-[color:var(--color-primary-tint)]">
              Sign in to ask for a price. Prices are given to you personally,
              never posted publicly.
            </p>
          </div>

          <div className="mx-auto w-full max-w-[320px] lg:max-w-none">
            <HeroJar className="h-auto w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}