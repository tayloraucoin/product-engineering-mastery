/**
 * The package's only process.env reader (codebase-conventions §5; D-STK-3).
 * drizzle.config.ts, the db:* scripts and the integration tests import it; the
 * runtime client never does, because an app hands it its URL.
 *
 * DATABASE_URL is the runtime URL: the transaction pooler on a hosted tier.
 * DATABASE_MIGRATION_URL is the session pooler, for migrations and setup SQL.
 * Each takes the _LOCAL and _STAGING suffixes. On the local tier an unset
 * value means the database `yarn db:local` starts.
 *
 * NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are the auth
 * variables (D-STK-6). Their _LOCAL values select the local mode: a hosted
 * staging URL is Mode A (the mirror), a loopback URL is Mode B (the full
 * stack). There is no mode variable. `db:seed-users` reads them.
 */

import { pickTiered, tierName } from "@pem/env/pick";
import { parseTier, type Tier } from "@pem/env/tier";

import { LOCAL_IMAGE_URL } from "./local-image.ts";

const raw = {
  DATABASE_ENVIRONMENT: process.env.DATABASE_ENVIRONMENT,
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_URL_LOCAL: process.env.DATABASE_URL_LOCAL,
  DATABASE_URL_STAGING: process.env.DATABASE_URL_STAGING,
  DATABASE_MIGRATION_URL: process.env.DATABASE_MIGRATION_URL,
  DATABASE_MIGRATION_URL_LOCAL: process.env.DATABASE_MIGRATION_URL_LOCAL,
  DATABASE_MIGRATION_URL_STAGING: process.env.DATABASE_MIGRATION_URL_STAGING,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_URL_LOCAL: process.env.NEXT_PUBLIC_SUPABASE_URL_LOCAL,
  NEXT_PUBLIC_SUPABASE_URL_STAGING:
    process.env.NEXT_PUBLIC_SUPABASE_URL_STAGING,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_SERVICE_ROLE_KEY_LOCAL: process.env.SUPABASE_SERVICE_ROLE_KEY_LOCAL,
  SUPABASE_SERVICE_ROLE_KEY_STAGING:
    process.env.SUPABASE_SERVICE_ROLE_KEY_STAGING,
};

export const tier: Tier = parseTier(raw.DATABASE_ENVIRONMENT);

function resolve(name: "DATABASE_URL" | "DATABASE_MIGRATION_URL"): string {
  const value = pickTiered(raw, name, tier);
  if (value) return value;
  if (tier === "local") return LOCAL_IMAGE_URL;
  throw new Error(
    `Set ${tierName(name, tier)} (or ${name}) for DATABASE_ENVIRONMENT=${tier}; see .env.example.`,
  );
}

/** The runtime URL for this tier. */
export function runtimeUrl(): string {
  return resolve("DATABASE_URL");
}

/** The migration URL for this tier. */
export function migrationUrl(): string {
  return resolve("DATABASE_MIGRATION_URL");
}

/** The auth URL and service-role key for this tier; either may be unset. */
export function authSettings(): {
  url: string | undefined;
  serviceRoleKey: string | undefined;
} {
  return {
    url: pickTiered(raw, "NEXT_PUBLIC_SUPABASE_URL", tier),
    serviceRoleKey: pickTiered(raw, "SUPABASE_SERVICE_ROLE_KEY", tier),
  };
}

/** The variable name that holds the auth URL on this tier, for messages. */
export function authUrlName(): string {
  return tierName("NEXT_PUBLIC_SUPABASE_URL", tier);
}

/**
 * The environment for a Supabase CLI child process: this one's, plus
 * `overrides`. The CLI reads SUPABASE_-prefixed overrides of config.toml.
 */
export function cliEnvironment(
  overrides: Record<string, string> = {},
): NodeJS.ProcessEnv {
  return { ...process.env, ...overrides };
}
