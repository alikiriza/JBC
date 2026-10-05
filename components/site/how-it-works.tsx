import {
  StepPriceIllustration,
  StepSignInIllustration,
  StepSizeIllustration,
} from "@/components/illustrations";

/**
 * "How it works" — three steps laid out as a horizontal run on desktop,
 * with a connecting line so they read as a sequence.
 */
const STEPS = [
  {
    title: "Sign in",
    body: "Use your Google account. No password to remember.",
    Illustration: StepSignInIllustration,
  },
  {
    title: "Choose a size",
    body: "Pick the jar size and how many you need.",
    Illustration: StepSizeIllustration,
  },
  {
    title: "Get your price",
    body: "We reply with a price for your request. Only you see it.",
    Illustration: StepPriceIllustration,
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[color:var(--color-bg)]">
      <div className="mx-auto w-full max-w-[var(--container-page)] px-5 py-20 sm:py-24 lg:py-28">
        <h2 className="max-w-[22ch] text-[30px] font-bold text-[color:var(--color-primary-dark)] sm:text-[36px]">
          How getting a price works
        </h2>

        <ol className="relative mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
          {/* the connecting run, desktop only */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-[60px] hidden h-px bg-[color:var(--color-border-strong)] md:block"
          />

          {STEPS.map(({ title, body, Illustration }, i) => (
            <li key={title} className="relative flex flex-col items-start">
              <div className="w-full max-w-[160px]">
                <Illustration className="h-auto w-full" />
              </div>

              <p className="mt-5 text-[14px] font-medium text-[color:var(--color-secondary)]">
                Step {i + 1}
              </p>
              <h3 className="mt-1 text-[20px] font-semibold text-[color:var(--color-primary-dark)]">
                {title}
              </h3>
              <p className="mt-2 max-w-[34ch] text-[15px] leading-relaxed text-[color:var(--color-text-muted)]">
                {body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}