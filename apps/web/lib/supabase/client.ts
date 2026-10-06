/**
 * The browser's Supabase client. It exists in the app, not in @pem/auth,
 * because Next inlines only a literal `process.env.NEXT_PUBLIC_*` read, and
 * env.ts holds those literals; @pem/auth never reads process.env. Import it
 * from a client component only; a server file uses `./server`.
 */

import { createBrowserAuthClient } from "@pem/auth/browser";

import { requireSupabaseConfig } from "./config";

export function createSupabaseBrowserClient() {
  return createBrowserAuthClient(requireSupabaseConfig());
}
