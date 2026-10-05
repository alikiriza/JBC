import { GetAPriceCta } from "@/components/site/get-a-price-cta";

/**
 * Final call to action. This is the only place the yellow button appears
 * twice on the page, so it reads as one action offered in two spots rather
 * than two competing actions.
 */
export function GetAPrice() {
  return (
    <section id="get-a-price" className="bg-[color:var(--color-surface-tint)]">
      <div className="mx-auto w-full max-w-[var(--container-page)] px-5 py-20 sm:py-24">
        <div className="mx-auto max-w-[640px] rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-primary-dark)] p-8 text-center shadow-md sm:p-12">
          <h2 className="text-[28px] font-bold text-white sm:text-[34px]">
            Ask for your price
          </h2>

          <p className="mx-auto mt-4 max-w-[44ch] text-[16px] leading-relaxed text-[color:var(--color-primary-tint)]">
            Sign in with Google, choose the size you need, and add a note about
            the skin condition if you want to. We reply with your price. Nobody
            else sees it.
          </p>

          <div className="mt-8 flex justify-center">
            <GetAPriceCta />
          </div>
        </div>
      </div>
    </section>
  );
}