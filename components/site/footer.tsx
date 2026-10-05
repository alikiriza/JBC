import { Wordmark } from "@/components/site/wordmark";

/**
 * Footer. Carries the patch-test note from project-description.md.
 *
 * PLACEHOLDER: the contact email and WhatsApp number below are stand-ins.
 * project-description.md lists "Admin contact method (WhatsApp number or
 * phone) shown after pricing" as an open item.
 */
export function Footer() {
  return (
    <footer className="border-t border-[color:var(--color-border)] bg-[color:var(--color-primary-tint)]">
      <div className="mx-auto w-full max-w-[var(--container-page)] px-5 py-14">
        <div className="grid gap-10 sm:grid-cols-2">
          <div className="max-w-sm">
            <Wordmark className="text-[color:var(--color-primary-dark)]" />
            <p className="mt-4 text-[15px] leading-relaxed text-[color:var(--color-text-muted)]">
              An all-natural herbal skin cream made from herbs with no
              artificial additives.
            </p>
          </div>

          <div>
            <h2 className="text-[15px] font-semibold text-[color:var(--color-primary-dark)]">
              Contact
            </h2>
            {/* PLACEHOLDER — replace with the real contact details */}
            <ul className="mt-3 space-y-2 text-[15px] text-[color:var(--color-text-muted)]">
              <li>
                <span className="text-[color:var(--color-text)]">
                  hello@example.com
                </span>{" "}
                <span className="text-[14px]">(email to confirm)</span>
              </li>
              <li>
                <span className="text-[color:var(--color-text)]">
                  +000 000 0000
                </span>{" "}
                <span className="text-[14px]">(WhatsApp number to confirm)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* The safety note from project-description.md, given its own block so
            it cannot be mistaken for small print. */}
        <p className="mt-12 rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] p-5 text-[15px] leading-relaxed text-[color:var(--color-text)]">
          <span className="font-semibold">Please note.</span> For external use
          only. Do a small patch test first. For severe burns or conditions
          that don&apos;t improve, see a doctor.
        </p>

        <p className="mt-8 text-[14px] text-[color:var(--color-text-muted)]">
          © {new Date().getFullYear()} JBC. All rights reserved.
        </p>
      </div>
    </footer>
  );
}