/**
 * `yarn db:migrate`: applies the generated migrations to this tier's database
 * over the session pooler. Run `yarn db:setup` after it.
 */

import { describeUrl } from "../src/connection.ts";
import { openMigrationClient, runMigrations } from "./database.ts";
import { migrationUrl, tier } from "./env.ts";

const url = migrationUrl();
console.log(`db:migrate — ${tier} at ${describeUrl(url)}`);
const client = openMigrationClient(url, tier);
try {
  await runMigrations(client);
  console.log("db:migrate — done");
} finally {
  await client.end();
}
