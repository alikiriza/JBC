import {
  BurnIllustration,
  DrySkinIllustration,
  FungalIllustration,
  RashIllustration,
} from "@/components/illustrations";

/**
 * "What it helps with" — a two-column list, deliberately not a grid of
 * equal tiles. The condition name sits in a tinted chip so it is findable
 * by scanning rather than reading.
 */
const CONDITIONS = [
  {
    name: "Fungal infections",
    body: "Cream made to help clear fungal infections on the skin.",
    Illustration: FungalIllustration,
  },
  {
    name: "Burns",
    body: "Soothes skin that has been burned, alongside the advice a doctor gives you.",
    Illustration: BurnIllustration,
  },
  {
    name: "Eczema and rashes",
    body: "For irritated, itchy skin including eczema and everyday rashes.",
    Illustration: RashIllustration,
  },
  {
    name: "Dry skin",
    body: "For dry, rough skin that needs moisture back.",
    Illustration: DrySkinIllustration,
  },
] as const;

export function Conditions() {
  return (
    <section
      id="what-it-helps-with"
      className="bg-[color:var(--color-surface-tint)]"
    >
      <div className="mx-auto w-full max-w-[var(--container-page)] px-5 py-20 sm:py-24 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <h2 className="max-w-[16ch] text-[30px] font-bold text-[color:var(--color-primary-dark)] sm:text-[36px]">
              What it helps with
            </h2>
            <p className="mt-5 max-w-[40ch] text-[16px] leading-relaxed text-[color:var(--color-text-muted)]">
              Most skin conditions, from fungal infections to eczema, rashes and
              dry skin.
            </p>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {CONDITIONS.map(({ name, body, Illustration }) => (
              <li
                key={name}
                className="flex flex-col rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-5 shadow-xs"
              >
                <div className="mb-4 aspect-[5/2] w-full overflow-hidden rounded-md bg-[color:var(--color-primary-tint)]">
                  <Illustration className="h-full w-full" />
                </div>
                <span className="inline-flex w-fit items-center rounded-full bg-[color:var(--color-accent-tint)] px-3 py-1 text-[13px] font-medium text-[color:var(--color-text)]">
                  {name}
                </span>
                <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--color-text-muted)]">
                  {body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}