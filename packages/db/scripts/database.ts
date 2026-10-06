/**
 * Migrations and setup SQL, shared by `db:migrate`, `db:setup` and the
 * integration tests. Both run over the migration URL: the session pooler on a
 * hosted tier (D-STK-5).
 */

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

import type { Tier } from "@pem/env/tier";

import { assertPooler } from "../src/connection.ts";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export const MIGRATIONS_DIR = path.join(packageRoot, "migrations");
export const SETUP_DIR = path.join(packageRoot, "supabase", "setup");

/** A single-connection client on the migration URL. */
export function openMigrationClient(url: string, tier: Tier): postgres.Sql {
  return postgres(assertPooler(url, "migration", tier), {
    max: 1,
    onnotice: () => {},
  });
}

/** Applies every migration not yet in drizzle's journal. */
export async function runMigrations(client: postgres.Sql): Promise<void> {
  await migrate(drizzle({ client }), { migrationsFolder: MIGRATIONS_DIR });
}

/** The setup files, in the order they apply: by file name. */
export function setupFiles(): string[] {
  return readdirSync(SETUP_DIR)
    .filter((name) => name.endsWith(".sql"))
    .sort();
}

/** Applies every setup file in order. Each file is idempotent, so a rerun changes nothing. */
export async function applySetup(
  client: postgres.Sql,
  log: (file: string) => void = () => {},
): Promise<void> {
  for (const file of setupFiles()) {
    log(file);
    await client.unsafe(readFileSync(path.join(SETUP_DIR, file), "utf8"));
  }
}
