"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { GoogleMark } from "@/components/ui/google-mark";
import { Button } from "@/components/ui/button";

/**
 * Google sign-in. The only sign-in method JBC offers: no passwords, no other
 * providers, no email step.
 *
 * Google owns the button's appearance, so this renders the official four-colour
 * mark on the JBC yellow call-to-action button.
 *
 * `configured` is passed in from the server component that renders this. The
 * browser cannot read GOOGLE_CLIENT_ID (it is not a NEXT_PUBLIC_ variable), so
 * the server is the only place that can honestly know whether keys exist. When
 * they do not, the button is disabled and says so, rather than throwing.
 */
export function GoogleSignInButton({
  size = "lg",
  className,
  configured = true,
}: {
  size?: "md" | "lg";
  className?: string;
  configured?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    setError(null);
    setLoading(true);

    try {
      // On success the browser leaves for Google, so nothing after this runs.
      // errors are surfaced through the callback, not thrown.
      const { error: signInError } = await authClient.signIn.social({
        provider: "google",
        // Where Better Auth sends the person once Google hands them back.
        callbackURL: "/requests",
      });

      if (signInError) throw signInError;
    } catch {
      setError(
        "Sign in could not start. Please check your connection and try again.",
      );
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <Button
        variant="cta"
        size={size}
        onClick={handleSignIn}
        disabled={!configured || loading}
      >
        {loading ? (
          <span
            aria-hidden
            className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[color:var(--color-text)]/30 border-t-[color:var(--color-text)]"
          />
        ) : (
          <GoogleMark className="h-5 w-5 shrink-0" />
        )}
        {/* The label stays put while loading, so the button never resizes. */}
        {loading ? "Opening Google" : "Sign in with Google"}
      </Button>

      {!configured ? (
        <p
          role="status"
          className="mt-3 rounded-sm border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-4 py-3 text-[14px] leading-relaxed text-[color:var(--color-text)]"
        >
          Sign in is being connected now. It will be ready in the next step of
          the build.
        </p>
      ) : error ? (
        /* Error state: an icon and words, never colour alone. */
        <p
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-sm border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-4 py-3 text-[14px] leading-relaxed text-[color:var(--color-text)]"
        >
          <svg
            viewBox="0 0 20 20"
            aria-hidden
            className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-error)]"
          >
            <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.15" />
            <path
              d="M10 5.5v5M10 14v.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          {error}
        </p>
      ) : null}
    </div>
  );
}