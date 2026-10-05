import Link from "next/link";
import { headers } from "next/headers";
import { Wordmark } from "@/components/site/wordmark";
import { SignOutButton } from "@/components/site/sign-out-button";
import { auth } from "@/lib/auth";

/**
 * Nav. One destination rather than a row of links, because the landing page is
 * a single scroll.
 *
 * A Server Component, so it knows who is signed in on the first render with no
 * client-side fetch. Signed out it offers the "Get a price" jump link; signed
 * in it offers the person's name, their requests page, and sign-out.
 *
 * The session read is wrapped in try/catch because the nav renders inside the
 * root layout on every page. If the database is unreachable or the env is not
 * filled in yet, the nav must still render — it falls back to the signed-out
 * state rather than taking the whole site down with it.
 */
export async function Nav() {
  let user: { name?: string | null; email: string } | null = null;

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session) {
      user = { name: session.user.name, email: session.user.email };
    }
  } catch {
    user = null;
  }

  return (
    <header className="sticky top-0 z-50 bg-[color:var(--color-primary-dark)]">
      <div className="mx-auto flex h-16 w-full max-w-[var(--container-page)] items-center justify-between gap-4 px-5">
        <Wordmark className="text-white" />

        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden max-w-[180px] truncate text-[15px] font-medium text-white/90 lg:inline">
              {user.name || user.email}
            </span>
            <Link
              href="/requests"
              className="hidden min-h-[44px] items-center rounded-full px-3 text-[15px] font-medium text-white transition-[background-color] duration-150 hover:bg-white/10 sm:inline-flex"
            >
              My requests
            </Link>
            <SignOutButton />
          </div>
        ) : (
          <a
            href="#get-a-price"
            className="inline-flex min-h-[44px] items-center rounded-full bg-[color:var(--color-accent)] px-5 text-[15px] font-medium text-[color:var(--color-text)] transition-[filter,transform] duration-150 hover:brightness-[0.97] active:scale-[0.98]"
          >
            Get a price
          </a>
        )}
      </div>
    </header>
  );
}