/**
 * The request's Supabase client in a Server Component, Server Action or Route
 * Handler, over next/headers' cookies. A Server Component cannot write
 * cookies; proxy.ts has already refreshed the session before it renders, so
 * the write it skips is never needed there.
 */

import "server-only";

import { cookies } from "next/headers";

import { createServerAuthClient } from "@pem/auth/server";

import { requireSupabaseConfig } from "./config";

export async function createSupabaseServerClient() {
  const store = await cookies();
  return createServerAuthClient(requireSupabaseConfig(), {
    getAll: () => store.getAll(),
    setAll: (written) => {
      try {
        for (const { name, value, options } of written)
          store.set(name, value, options);
      } catch {
        // A Server Component's cookies are read-only; proxy.ts refreshes instead.
      }
    },
  });
}
