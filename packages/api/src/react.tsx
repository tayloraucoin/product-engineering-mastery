"use client";

/**
 * `@pem/api/react`: the client side of the API (D-STK-8), on
 * `@trpc/tanstack-react-query`. Query hooks live here and nowhere else;
 * `@pem/hooks` never imports this package, and a hook there takes the client
 * it calls.
 *
 *   const trpc = useTRPC();
 *   const notes = useQuery(trpc.notes.list.queryOptions());
 *
 * Mount `ApiProvider` once, in the root layout. Only the router's type comes
 * from the server side, so no server code reaches the browser.
 */
import { useState, type ReactNode } from "react";
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import superjson from "superjson";

import type { AppRouter } from "./root.ts";

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();

function makeQueryClient() {
  return new QueryClient({
    // Data fetched on one render is not fetched again the instant the page hydrates.
    defaultOptions: { queries: { staleTime: 30_000 } },
  });
}

let browserQueryClient: QueryClient | undefined;

/** A new client per server render, so users never share a cache; one for the browser's lifetime. */
function getQueryClient() {
  if (isServer) return makeQueryClient();
  return (browserQueryClient ??= makeQueryClient());
}

export function ApiProvider({
  children,
  url = "/api/trpc",
}: {
  children: ReactNode;
  /** Where the route is mounted; relative, so the browser calls its own origin. */
  url?: string;
}) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [httpBatchLink({ url, transformer: superjson })],
    }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
