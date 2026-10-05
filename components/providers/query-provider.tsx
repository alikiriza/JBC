"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * React Query provider.
 *
 * A Server Component cannot hold the QueryClient, so this is a small client
 * wrapper that creates one per browser session and hands it down through context.
 *
 * The QueryClient is created inside useState rather than at module scope on
 * purpose. At module scope it would be a single object shared by every visitor
 * on the server, so one person's cached price requests could be served to
 * another from memory. useState gives each browser its own.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // master_prompt.md §DATA FETCHING: 30s of freshness. A client
            // checking whether their price has been set should not be made to
            // reload the page to see an admin's reply.
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            // Refetching on every tab focus would pull the whole list back
            // unnoticed while somebody is reading a price.
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}