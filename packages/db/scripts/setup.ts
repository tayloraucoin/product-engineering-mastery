/**
 * `yarn db:setup`: applies supabase/setup/*.sql in file-name order, after
 * `yarn db:migrate`. Every file is idempotent, so a rerun is safe. An unset
 * tier, or a hosted tier with no URL of its own, is refused in one line before
 * anything connects.
 */

import type postgres from "postgres";

import type { Tier } from "@pem/env/tier";

import { describeUrl } from "../src/connection.ts";
import { applySetup, openMigrationClient } from "./database.ts";
import { migrationUrl, requireTier } from "./env.ts";

const COMMAND = "db:setup";

let tier: Tier;
let url: string;
let client: postgres.Sql;
try {
  tier = requireTier();
  url = migrationUrl();
  client = openMigrationClient(url, tier);
} catch (error) {
  console.error(
    `${COMMAND} — ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
}

console.log(`${COMMAND} — ${tier} at ${describeUrl(url)}`);
try {
  await applySetup(client, (file) => console.log(`  ${file}`));
  console.log(`${COMMAND} — done`);
} finally {
  await client.end();
}
