import Link from "next/link";
import { JarEmptyIllustration } from "@/components/illustrations";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata = {
  title: "Page not found | JBC",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-[var(--container-page)] flex-col items-center px-5 py-24 text-center">
      <JarEmptyIllustration className="mb-8 h-auto w-[180px]" />

      <p className="text-[15px] font-medium text-[color:var(--color-secondary)]">
        404
      </p>
      <h1 className="mt-2 text-[30px] font-bold text-[color:var(--color-primary-dark)] sm:text-[36px]">
        We could not find that page
      </h1>
      <p className="mt-4 max-w-[42ch] text-[16px] leading-relaxed text-[color:var(--color-text-muted)]">
        The link may be old or mistyped. The JBC landing page has everything
        about the cream and how to ask for a price.
      </p>

      <div className="mt-8">
        <ButtonLink href="/" variant="primary" size="lg">
          Back to the JBC page
        </ButtonLink>
      </div>

      <p className="mt-6 text-[15px] text-[color:var(--color-text-muted)]">
        Or{" "}
        <Link
          href="/"
          className="text-[color:var(--color-secondary)] underline underline-offset-2 hover:no-underline"
        >
          start again from the top
        </Link>
        .
      </p>
    </div>
  );
}