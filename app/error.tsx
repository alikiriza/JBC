"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertIllustration } from "@/components/illustrations";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Server-side detail only. Never surface the raw message to the visitor.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-[var(--container-page)] flex-col items-center px-5 py-24 text-center">
      <AlertIllustration className="mb-8 h-auto w-[180px]" />

      <h1 className="text-[30px] font-bold text-[color:var(--color-primary-dark)] sm:text-[36px]">
        Something went wrong
      </h1>
      <p className="mt-4 max-w-[42ch] text-[16px] leading-relaxed text-[color:var(--color-text-muted)]">
        This page did not load properly. Trying again usually fixes it. If it
        keeps happening, please get in touch.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button variant="primary" size="lg" onClick={reset}>
          Try again
        </Button>
        <Button variant="outline" size="lg" onClick={() => router.push("/")}>
          Go to the JBC page
        </Button>
      </div>
    </div>
  );
}