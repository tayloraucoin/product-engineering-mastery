/**
 * The admin client (D-STK-7): the service-role key, which bypasses row-level
 * security and every Auth rule. Server-only, for a service acting as the
 * system, never for a user's request. It holds no session: nothing is
 * persisted, refreshed or read from a URL, so one admin call can never sign a
 * process in as a user.
 */

import { createClient } from "@supabase/supabase-js";

export type AdminConfig = {
  url: string;
  /** `SUPABASE_SERVICE_ROLE_KEY` for the tier: a server-only variable. */
  serviceRoleKey: string;
};

/** The session settings the admin client is built with; exported so a test can hold them. */
export const ADMIN_AUTH_OPTIONS = {
  persistSession: false,
  autoRefreshToken: false,
  detectSessionInUrl: false,
} as const;

export function createAdminAuthClient(config: AdminConfig) {
  return createClient(config.url, config.serviceRoleKey, {
    auth: ADMIN_AUTH_OPTIONS,
  });
}
