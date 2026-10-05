import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { RequestForm } from "@/components/requests/request-form";
import { StepSizeIllustration } from "@/components/illustrations";

/**
 * Ask for a price.
 *
 * Protected twice, like every other private page: middleware turns away visitors
 * with no session cookie before this file renders, and the session check below
 * is what the page actually trusts. Relying on middleware alone would be relying
 * on the mere presence of a cookie.
 */

export const metadata: Metadata = {
  title: "Ask for a price — JBC Skin Cream",
  description:
    "Choose the JBC cream size you need, tell us about the skin condition, and we will reply with your price.",
};

export default async function NewRequestPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/");

  return (
    <div className="bg-[color:var(--color-bg)]">
      <div className="mx-auto grid w-full max-w-[var(--container-page)] gap-10 px-5 py-16 sm:py-20 lg:grid-cols-[1fr_320px] lg:gap-16">
        <div className="max-w-[600px]">
          <p className="text-[14px] font-medium text-[color:var(--color-secondary)]">
            Step 2
          </p>
          <h1 className="mt-2 text-[30px] font-bold text-[color:var(--color-primary-dark)] sm:text-[36px]">
            Ask for your price
          </h1>
          <p className="mt-3 max-w-[52ch] text-[16px] leading-relaxed text-[color:var(--color-text-muted)]">
            Choose a size, say how many you need, and add a note if you want to.
            We reply with a price for you. Nobody else sees it.
          </p>

          <div className="mt-10">
            <RequestForm />
          </div>
        </div>

        {/* A quiet reassurance panel rather than a second competing call to
            action. It sits beside the form on desktop and below it on mobile,
            and never asks for anything — the form is the only thing to do here. */}
        <aside className="lg:pt-24">
          <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-tint)] p-6">
            <StepSizeIllustration className="h-auto w-full max-w-[160px]" />

            <h2 className="mt-5 text-[18px] font-semibold text-[color:var(--color-primary-dark)]">
              What happens next
            </h2>
            <ol className="mt-3 space-y-3 text-[15px] leading-relaxed text-[color:var(--color-text-muted)]">
              <li>
                <span className="font-medium text-[color:var(--color-text)]">
                  1. We read your request.
                </span>{" "}
                Your note helps us quote the right thing.
              </li>
              <li>
                <span className="font-medium text-[color:var(--color-text)]">
                  2. We reply with a price.
                </span>{" "}
                It appears on your requests page.
              </li>
              <li>
                <span className="font-medium text-[color:var(--color-text)]">
                  3. You decide.
                </span>{" "}
                There is nothing to pay here.
              </li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}