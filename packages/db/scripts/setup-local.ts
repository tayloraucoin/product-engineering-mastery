/**
 * `yarn db:setup:local`: prepares a Postgres on this machine (Postgres.app,
 * Homebrew) as the local tier's database, with no Docker and no Supabase
 * project. It creates the database the local migration URL names when it is
 * missing, applies supabase/local-shim.sql (the roles and the auth.users
 * table Supabase's own image would provide), then the migrations and the
 * setup SQL, and marks the database as a local auth mirror target. Idempotent:
 * a rerun changes nothing. It refuses an unset or hosted tier, and a URL that
 * is not this machine, before connecting. It changes a database, so bash-guard
 * and the permissions ask first (D-STK-18).
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

import type { Tier } from "@pem/env/tier";

import { describeUrl } from "../src/connection.ts";
import { assertLoopbackClient, isLoopbackUrl } from "../src/loopback.ts";
import { applySetup, openMigrationClient, runMigrations } from "./database.ts";
import {
  ADD_RECIPE,
  EXAMPLE_FILE,
  hasOwnLocalUrl,
  migrationUrl,
  requireTier,
} from "./env.ts";
import { markLocalAuthMirror } from "./local-auth-marker.ts";

const COMMAND = "db:setup:local";
const SHIM = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../supabase/local-shim.sql",
);

function refuse(message: string): never {
  console.error(`${COMMAND} — refused: ${message}`);
  process.exit(1);
}

/** The database a connection URL names; `postgres` when the path is empty. */
export function databaseName(url: string): string {
  return (
    decodeURIComponent(new URL(url).pathname.replace(/^\//, "")) || "postgres"
  );
}

/**
 * Creates the database `url` names when it is missing, through the server's
 * own `postgres` maintenance database on the same host, user and port.
 */
export async function ensureDatabase(
  url: string,
): Promise<"created" | "exists"> {
  const name = databaseName(url);
  if (name === "postgres") return "exists";
  const maintenance = new URL(url);
  maintenance.pathname = "/postgres";
  const sql = postgres(maintenance.href, { max: 1, onnotice: () => {} });
  try {
    assertLoopbackClient(sql);
    const [row] = await sql`select 1 from pg_database where datname = ${name}`;
    if (row) return "exists";
    await sql.unsafe(`create database "${name.replace(/"/g, '""')}"`);
    return "created";
  } finally {
    await sql.end();
  }
}

async function main(): Promise<void> {
  let tier: Tier;
  try {
    tier = requireTier();
  } catch (error) {
    refuse(error instanceof Error ? error.message : String(error));
  }
  if (tier !== "local")
    refuse(
      `DATABASE_ENVIRONMENT is ${tier}. This prepares a Postgres on this machine for the local tier only; a hosted tier changes by migration (yarn db:migrate, then yarn db:setup).`,
    );
  if (!hasOwnLocalUrl("DATABASE_MIGRATION_URL"))
    refuse(
      `DATABASE_MIGRATION_URL_LOCAL is unset. Set it to your own Postgres, as ${EXAMPLE_FILE} does; unset means Docker's database (yarn db:local, ${ADD_RECIPE}).`,
    );
  const url = migrationUrl();
  if (!isLoopbackUrl(url))
    refuse(
      `the local migration URL points at ${describeUrl(url)}, which is not this machine. Point DATABASE_MIGRATION_URL_LOCAL at your own Postgres, as ${EXAMPLE_FILE} does, or at Docker's (${ADD_RECIPE}).`,
    );

  console.log(
    `${COMMAND} — local at ${describeUrl(url)} (a Postgres on this machine, no Docker)`,
  );
  console.log(`  database ${await ensureDatabase(url)}`);

  const client = openMigrationClient(url, tier);
  try {
    assertLoopbackClient(client);
    // Supabase Auth's own database (Docker's full stack, Mode B) is refused
    // before the shim touches its auth schema; the marker check below is the
    // second guard.
    const [owned] = await client<{ auth_owned: boolean }[]>`
      select to_regclass('auth.identities') is not null as auth_owned`;
    if (owned?.auth_owned)
      refuse(
        `this database belongs to Supabase Auth (auth.identities exists), so nothing here changes it. Point DATABASE_MIGRATION_URL_LOCAL at a database of your own.`,
      );
    await client.unsafe(readFileSync(SHIM, "utf8"));
    console.log(
      "  shim applied: roles anon, authenticated, service_role, supabase_auth_admin (no login); auth.users",
    );
    await runMigrations(client);
    console.log("  migrations applied");
    await applySetup(client, (file) => console.log(`  setup ${file}`));
    if ((await markLocalAuthMirror(client)) === "auth-owned") {
      console.error(
        `${COMMAND} — this database belongs to Supabase Auth (auth.identities exists), so the local auth mirror stays shut. Point DATABASE_MIGRATION_URL_LOCAL at a database of your own.`,
      );
      process.exitCode = 1;
      return;
    }
    console.log("  local auth mirror marked");
    console.log(`${COMMAND} — done; next: yarn test:db`);
  } finally {
    await client.end();
  }
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const hint = /ECONNREFUSED|CONNECTION_ENDED|connect/i.test(message)
      ? " Is Postgres running on this machine (Postgres.app, or brew services start postgresql)?"
      : "";
    console.error(`${COMMAND} — ${message}${hint}`);
    process.exit(1);
  }
}
