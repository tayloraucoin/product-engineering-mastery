/**
 * The package's only process.env reader (codebase-conventions §5; D-STK-3).
 * The db:* scripts and the integration tests import it; drizzle.config.ts
 * reads no environment, and the runtime client never does, because an app
 * hands it its URL.
 *
 * The tier is read on demand, never at import, so importing a script in a
 * unit test throws nothing. An unset DATABASE_ENVIRONMENT is refused, naming
 * the variable and the example file; nothing here guesses a tier. The local
 * tier is a Postgres on this machine (`yarn db:setup:local`, no Docker);
 * Docker's database is the add recipe, and a hosted tier is its own project.
 *
 * DATABASE_URL is the runtime URL: the transaction pooler on a hosted tier.
 * DATABASE_MIGRATION_URL is the session pooler, for migrations and setup SQL.
 * Each takes the _LOCAL and _STAGING suffixes, and a hosted tier reads only
 * its own suffix or the unsuffixed name, never _LOCAL. On the local tier an
 * unset value means Docker's database, which `yarn db:local` starts;
 * `db:setup:local` refuses that and asks for your own.
 *
 * NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are the auth
 * variables (D-STK-6). Their _LOCAL values select the local mode: a hosted
 * staging URL is Mode A (the mirror), a loopback URL is Mode B (the full
 * stack). There is no mode variable. `db:seed-users` reads them.
 */

import { pickTiered, tierName } from "@pem/env/pick";
import { isTier, TIER_SWITCH, TIERS, type Tier } from "@pem/env/tier";

import { LOCAL_IMAGE_URL } from "./local-image.ts";

/** The file each developer copies to packages/db/.env.local. */
export const EXAMPLE_FILE = "packages/db/.env.example";
/** The recipe that puts the local tier's database in Docker instead of your own Postgres. */
export const ADD_RECIPE = "docs/runbooks/add/docker-local-database.md";

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

/**
 * The tier the scripts act on. Unset or empty is refused, naming the variable
 * and the example file; so is any value that is not a tier name. Unlike the
 * apps, which treat unset as local (EN-08), no database script guesses.
 */
export function requireTier(): Tier {
  const value = raw.DATABASE_ENVIRONMENT?.trim() ?? "";
  if (value === "") {
    throw new Error(
      `${TIER_SWITCH} is unset. Copy ${EXAMPLE_FILE} to packages/db/.env.local, or set it to one of ${TIERS.join(", ")}; no database script guesses a tier.`,
    );
  }
  if (!isTier(value)) {
    throw new Error(
      `${TIER_SWITCH} is "${value}"; set it to one of ${TIERS.join(", ")}.`,
    );
  }
  return value;
}

function resolve(name: "DATABASE_URL" | "DATABASE_MIGRATION_URL"): string {
  const tier = requireTier();
  const value = pickTiered(raw, name, tier);
  if (value) return value;
  if (tier === "local") return LOCAL_IMAGE_URL;
  throw new Error(
    `Set ${tierName(name, tier)} (or ${name}) for ${TIER_SWITCH}=${tier}; see ${EXAMPLE_FILE}.`,
  );
}

/** Whether the local tier has its own value for `name`, rather than Docker's fallback. */
export function hasOwnLocalUrl(
  name: "DATABASE_URL" | "DATABASE_MIGRATION_URL",
): boolean {
  return pickTiered(raw, name, "local") !== undefined;
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
  const tier = requireTier();
  return {
    url: pickTiered(raw, "NEXT_PUBLIC_SUPABASE_URL", tier),
    serviceRoleKey: pickTiered(raw, "SUPABASE_SERVICE_ROLE_KEY", tier),
  };
}

/** The variable name that holds the auth URL on this tier, for messages. */
export function authUrlName(): string {
  return tierName("NEXT_PUBLIC_SUPABASE_URL", requireTier());
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
