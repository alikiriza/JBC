import {
  AntifungalIllustration,
  GentleIllustration,
  HerbsIllustration,
  NoAdditivesIllustration,
} from "@/components/illustrations";

/**
 * "Why JBC" — the four benefit claims from project-description.md.
 *
 * The cells are deliberately unequal: two wide cards on top, then a narrow
 * card beside a wide one. A row of four identical cards reads as filler.
 */
const BENEFITS = {
  herbs: {
    title: "Made from herbs",
    body: "The cream is blended from natural herbs. Nothing synthetic goes into the jar.",
    Illustration: HerbsIllustration,
  },
  additives: {
    title: "No artificial additives",
    body: "No artificial additives, no fillers, no colours added on top of the herbs.",
    Illustration: NoAdditivesIllustration,
  },
  antifungal: {
    title: "Antifungal",
    body: "Built to work against fungal infections on the skin.",
    Illustration: AntifungalIllustration,
  },
  gentle: {
    title: "Gentle on skin",
    body: "A soft, everyday cream made to be used on skin that is already sore or sensitive. Always patch test first.",
    Illustration: GentleIllustration,
  },
} as const;

export function WhyJbc() {
  const { herbs, additives, antifungal, gentle } = BENEFITS;

  return (
    <section id="why-jbc" className="bg-[color:var(--color-bg)]">
      <div className="mx-auto w-full max-w-[var(--container-page)] px-5 py-20 sm:py-24 lg:py-28">
        <h2 className="max-w-[20ch] text-[30px] font-bold text-[color:var(--color-primary-dark)] sm:text-[36px]">
          Why people reach for JBC
        </h2>

        <div className="mt-10 grid gap-5 sm:gap-6 lg:grid-cols-6">
          <BenefitCell {...herbs} className="lg:col-span-3" imageRatio="aspect-[16/10]" />
          <BenefitCell
            {...additives}
            className="lg:col-span-3"
            imageRatio="aspect-[16/10]"
          />
          <BenefitCell
            {...antifungal}
            className="lg:col-span-2"
            imageRatio="aspect-[4/3]"
          />
          <BenefitCell
            {...gentle}
            className="lg:col-span-4"
            imageRatio="aspect-[16/9]"
            wide
          />
        </div>
      </div>
    </section>
  );
}

type BenefitCellProps = {
  title: string;
  body: string;
  Illustration: (props: { className?: string }) => React.ReactNode;
  className?: string;
  imageRatio: string;
  /** When true the illustration sits beside the text instead of above it. */
  wide?: boolean;
};

function BenefitCell({
  title,
  body,
  Illustration,
  className,
  imageRatio,
  wide = false,
}: BenefitCellProps) {
  const art = (
    <div
      className={`${imageRatio} overflow-hidden rounded-md bg-[color:var(--color-primary-tint)] ${wide ? "w-full shrink-0 basis-2/5" : "w-full"}`}
    >
      <Illustration className="h-full w-full" />
    </div>
  );

  const text = (
    <div className={wide ? "min-w-0" : ""}>
      <h3 className="text-[20px] font-semibold text-[color:var(--color-primary-dark)]">
        {title}
      </h3>
      <p className="mt-2 max-w-[42ch] text-[15px] leading-relaxed text-[color:var(--color-text-muted)]">
        {body}
      </p>
    </div>
  );

  return (
    <article
      className={`rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-5 shadow-xs transition-[border-color,box-shadow] duration-150 hover:border-[color:var(--color-border-strong)] hover:shadow-sm sm:p-6 ${className ?? ""}`}
    >
      {wide ? (
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">{text}{art}</div>
      ) : (
        <>
          <div className="mb-5">{art}</div>
          {text}
        </>
      )}
    </article>
  );
}