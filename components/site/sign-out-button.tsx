"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

/**
 * Sign out.
 *
 * A client component because Better Auth's sign-out is a browser call. On
 * success we refresh rather than push, so the server components in the layout
 * re-read the now-empty session and the header flips back to signed-out.
 *
 * Styled as a plain text control to sit inside the dark green nav, not as a
 * shadcn button — the nav is JBC's own Phase 1 component, not a JB component.
 */
export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleSignOut() {
    setBusy(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.refresh();
        },
        onError: () => {
          setBusy(false);
        },
      },
    });
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={busy}
      className="inline-flex min-h-[44px] items-center rounded-full border border-white/30 px-4 text-[15px] font-medium text-white transition-colors duration-150 hover:bg-white/10 disabled:opacity-60"
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}