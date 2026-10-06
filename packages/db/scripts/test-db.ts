/**
 * `yarn test:db`: the integration tests in test/, one file at a time, against
 * the local database (your own Postgres after `yarn db:setup:local`, or
 * Docker's). Its first line says what it needs: on any tier but local it
 * exits before a test file loads, so a hosted database is never migrated or
 * written to by a test. Each file also refuses a URL that is not
 * this machine. Never part of `yarn test`.
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { cliEnvironment } from "./env.ts";
import { requireLocalTier } from "./supabase-cli.ts";

const COMMAND = "test:db";
const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

requireLocalTier(COMMAND, "any");
console.log(
  `${COMMAND} — local tier: running test/ against the local database, one file at a time`,
);

const result = spawnSync(
  process.execPath,
  ["--test", "--test-concurrency=1", "test/**/*.test.ts"],
  { cwd: packageRoot, stdio: "inherit", env: cliEnvironment() },
);
if (result.error) {
  console.error(`${COMMAND} — could not start node: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
