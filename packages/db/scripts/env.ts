/**
 * The package's only process.env reader (codebase-conventions §5; D-STK-3).
 * drizzle.config.ts, the db:* scripts and the integration tests import it; the
 * runtime client never does, because an app hands it its URL.
 *
 * DATABASE_URL is the runtime URL: the transaction pooler on a hosted tier.
 * DATABASE_MIGRATION_URL is the session pooler, for migrations and setup SQL.
 * Each takes the _LOCAL and _STAGING suffixes. On the local tier an unset
 * value means the image `yarn db:local` starts.
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
