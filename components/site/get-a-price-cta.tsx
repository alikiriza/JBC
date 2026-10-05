import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { GoogleSignInButton } from "@/components/site/google-sign-in-button";
import { googleConfigured } from "@/lib/auth-flags";

/**
 * The one call to action on the landing page.
 *
 * Signed out, it offers Google sign-in — the only way into the app
 * (project-description.md: Google-only). Signed in, offering "Sign in with
 * Google" again would be the single most confusing thing the page could do: the
 * visitor already signed in, and the button is the brightest thing on the
 * screen. So it becomes a link straight to the request form.
 *
 * A Server Component, so the right version is rendered on the first paint with
 * no flash of the wrong button. The session read is wrapped in try/catch for the
 * same reason lib/admin.ts and components/site/nav.tsx wrap theirs: this renders
 * inside the page for every visitor, including anyone whose database has not been
 * configured yet, and the landing page must not fall over because of it.
 */
export async function GetAPriceCta({ className }: { className?: string }) {
  let signedIn = false;

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    signedIn = Boolean(session);
  } catch {
    signedIn = false;
  }

  if (signedIn) {
    return (
      <Link
        href="/requests/new"
        className={`inline-flex min-h-[48px] items-center justify-center rounded-full bg-[color:var(--color-accent)] px-7 text-[16px] font-medium text-[color:var(--color-text)] transition-[filter,transform] duration-150 hover:brightness-[0.97] active:scale-[0.98] ${className ?? ""}`}
      >
        Ask for a price
      </Link>
    );
  }

  return <GoogleSignInButton className={className} configured={googleConfigured} />;
}