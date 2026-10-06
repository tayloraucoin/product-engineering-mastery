/**
 * The service-role client, for a service acting as the system (an invite, a
 * user deleted by an admin). It bypasses row-level security and every Auth
 * rule, so it never serves a user's request directly, and the key it holds is
 * server-only (check-client-bundle plants a sentinel for it).
 */

import "server-only";

import { createAdminAuthClient } from "@pem/auth/admin";

import { env } from "../../env";
import { requireSupabaseConfig } from "./config";

export function createSupabaseAdminClient() {
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey)
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set for this tier (or its _LOCAL or _STAGING form); see .env.example.",
    );
  return createAdminAuthClient({
    url: requireSupabaseConfig().url,
    serviceRoleKey,
  });
}
