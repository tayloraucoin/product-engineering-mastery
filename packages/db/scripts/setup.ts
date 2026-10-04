/**
 * `yarn db:setup`: applies supabase/setup/*.sql in file-name order, after
 * `yarn db:migrate`. Every file is idempotent, so a rerun is safe.
 */

import { describeUrl } from "../src/connection.ts";
import { applySetup, openMigrationClient } from "./database.ts";
import { migrationUrl, tier } from "./env.ts";

const url = migrationUrl();
console.log(`db:setup — ${tier} at ${describeUrl(url)}`);
const client = openMigrationClient(url, tier);
try {
  await applySetup(client, (file) => console.log(`  ${file}`));
  console.log("db:setup — done");
} finally {
  await client.end();
}
