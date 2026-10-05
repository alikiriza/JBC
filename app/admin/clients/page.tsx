import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminClientsTable } from "@/components/admin/admin-clients-table";

/**
 * /admin/clients — everyone who has signed in.
 *
 * Name, Google email and sign-up date, which is what project-description.md
 * specifies for this page. Read-only: there is deliberately no way to edit or
 * delete a client from here. JBC's admin job is to price requests, and every
 * control added to this page is another way to get a customer's record wrong.
 */

export const metadata: Metadata = {
  title: "Clients — Admin",
  description: "Everyone who has signed in with Google.",
};

export default function AdminClientsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[30px] font-bold text-[color:var(--color-primary-dark)]">
          Clients
        </h1>
        <p className="mt-2 max-w-[60ch] text-[16px] leading-relaxed text-[color:var(--color-text-muted)]">
          Everyone who has signed in with Google. Tap{" "}
          <span className="font-medium text-[color:var(--color-text)]">
            Set a price
          </span>{" "}
          on the Requests tab to reply to one.
        </p>
      </div>

      <Suspense fallback={<ClientsSkeleton />}>
        <AdminClientsTable />
      </Suspense>
    </div>
  );
}

function ClientsSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-hidden>
      <div className="h-11 w-full max-w-sm animate-pulse rounded-md bg-[color:var(--color-bg)]" />
      <ul className="flex flex-col gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <li
            key={i}
            className="animate-pulse rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-4"
          >
            <div className="h-4 w-44 rounded bg-[color:var(--color-surface-tint)]" />
            <div className="mt-2.5 h-3 w-64 rounded bg-[color:var(--color-surface-tint)]" />
          </li>
        ))}
      </ul>
    </div>
  );
}