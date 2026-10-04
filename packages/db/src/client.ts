/**
 * The runtime client (D-STK-5). `getDb` is the singleton: only the API context
 * and seeds hold it, and every user-scoped query goes through the bridge in
 * rls.ts, which takes this client and runs as `authenticated` under row-level
 * security. The singleton connects as the database owner and bypasses every
 * policy, so a query run on it directly is a service query.
 */

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import type { Tier } from "@pem/env/tier";

import { assertPooler } from "./connection.ts";
import * as schema from "./schema/index.ts";

export type Schema = typeof schema;

export type Db = PostgresJsDatabase<Schema> & { $client: postgres.Sql };

export type DbOptions = {
  /** The runtime URL: the transaction pooler on a hosted tier. */
  url: string;
  tier: Tier;
  /** Connections in the pool; the local image caps them low. */
  max?: number;
};

/** A new client. Prepared statements are off, as the transaction pooler requires. */
export function createDb({ url, tier, max }: DbOptions): Db {
  const client = postgres(assertPooler(url, "runtime", tier), {
    prepare: false,
    max: max ?? (tier === "local" ? 5 : 10),
  });
  return drizzle({ client, schema });
}

let singleton: { url: string; db: Db } | undefined;

/** The one runtime client for this process. A second URL is a wiring error. */
export function getDb(options: DbOptions): Db {
  if (!singleton) {
    singleton = { url: options.url, db: createDb(options) };
  } else if (singleton.url !== options.url) {
    throw new Error(
      "getDb was called with a second database URL; one process holds one runtime client.",
    );
  }
  return singleton.db;
}

/** Ends the singleton's pool, for scripts and tests that must exit. */
export async function closeDb(): Promise<void> {
  const current = singleton;
  singleton = undefined;
  await current?.db.$client.end();
}
