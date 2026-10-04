/**
 * The request seam for this app (@pem/auth/context, D-STK-7). Pages, actions
 * and route handlers call `getAuthContext()` and nothing else to learn who is
 * asking; services take the AuthContext it returns. React's `cache` makes it
 * one getUser call per request, and the resolver, held at module scope, calls
 * the local mirror once per user per process.
 */

import "server-only";

import { cache } from "react";

import { createAuthContextResolver, type AuthContext } from "@pem/auth/context";

import { supabaseConfig } from "./config";
import { localAuthMirror } from "./local-mirror";
import { createSupabaseServerClient } from "./server";

export type { AuthContext };

const resolveAuthContext = createAuthContextResolver({
  mirror: localAuthMirror(),
});

/** Who is asking, or null when the request is anonymous or Supabase cannot vouch for its session. */
export const getAuthContext = cache(async (): Promise<AuthContext | null> => {
  if (!supabaseConfig) return null;
  return resolveAuthContext(await createSupabaseServerClient());
});
