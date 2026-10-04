/**
 * `yarn db:local:reset`: empties the local database's public schema and
 * drizzle's journal, then reapplies the migrations and the setup SQL
 * (D-STK-18). It refuses any tier but local before it resolves a URL, and a
 * URL that is not loopback before it connects. The auth schema, the mirror's
 * marker and the public schema's own grants are left as they are.
 *
 * Its name never matches the deny rules on reset (`*db:reset*`); it is an ask
 * rule instead, like every command that changes a database. A hosted tier is
 * never reset: it changes by migration, which Taylor applies.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import type postgres from "postgres";

import { describeUrl } from "../src/connection.ts";
import { assertLoopbackClient, isLoopbackUrl } from "../src/loopback.ts";
import { applySetup, openMigrationClient, runMigrations } from "./database.ts";
import { migrationUrl, tier } from "./env.ts";

const COMMAND = "db:local:reset";

/**
 * Drops every object in public that no extension owns, and drizzle's journal
 * schema, in one transaction. Cascade takes indexes, policies, the triggers
 * on auth.users that call public functions, and the foreign keys into auth.
 */
const EMPTY_PUBLIC = `
do $$
declare
  r record;
begin
  for r in
    select c.relname, c.relkind
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('v', 'm', 'r', 'p', 'f', 'S')
      and not exists (
        select 1 from pg_depend d
        where d.classid = 'pg_class'::regclass and d.objid = c.oid and d.deptype = 'e'
      )
    order by case c.relkind when 'v' then 0 when 'm' then 1 when 'S' then 3 else 2 end
  loop
    execute format(
      'drop %s if exists public.%I cascade',
      case r.relkind
        when 'v' then 'view'
        when 'm' then 'materialized view'
        when 'f' then 'foreign table'
        when 'S' then 'sequence'
        else 'table'
      end,
      r.relname
    );
  end loop;

  for r in
    select p.proname, p.prokind, pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and not exists (
        select 1 from pg_depend d
        where d.classid = 'pg_proc'::regclass and d.objid = p.oid and d.deptype = 'e'
      )
  loop
    execute format(
      'drop %s if exists public.%I(%s) cascade',
      case r.prokind when 'a' then 'aggregate' when 'p' then 'procedure' else 'function' end,
      r.proname,
      r.args
    );
  end loop;

  for r in
    select t.typname
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    left join pg_class c on c.oid = t.typrelid
    where n.nspname = 'public'
      and (t.typtype in ('e', 'd', 'r', 'm') or (t.typtype = 'c' and c.relkind = 'c'))
      and not exists (
        select 1 from pg_depend d
        where d.classid = 'pg_type'::regclass and d.objid = t.oid and d.deptype = 'e'
      )
  loop
    execute format('drop type if exists public.%I cascade', r.typname);
  end loop;
end;
$$;
drop schema if exists drizzle cascade;
`;

/** Empties public and the journal, then migrates and applies the setup SQL. The client must be loopback. */
export async function resetLocalDatabase(
  client: postgres.Sql,
  log: (line: string) => void = () => {},
): Promise<void> {
  assertLoopbackClient(client);
  await client.begin((tx) => tx.unsafe(EMPTY_PUBLIC));
  log("public emptied, journal dropped");
  await runMigrations(client);
  log("migrations applied");
  await applySetup(client, (file) => log(`setup ${file}`));
}

function refuse(message: string): never {
  console.error(`${COMMAND} — refused: ${message}`);
  process.exit(1);
}

async function main(): Promise<void> {
  // A hosted tier is refused before any URL is resolved.
  if (tier !== "local")
    refuse(
      `DATABASE_ENVIRONMENT is ${tier}. Only the local database is ever reset; a hosted tier changes by migration, which Taylor applies.`,
    );
  const url = migrationUrl();
  if (!isLoopbackUrl(url))
    refuse(
      `the local migration URL points at ${describeUrl(url)}, which is not this machine. Point DATABASE_MIGRATION_URL_LOCAL at the local database, or unset it.`,
    );

  console.log(`${COMMAND} — local at ${describeUrl(url)}`);
  const client = openMigrationClient(url, tier);
  try {
    await resetLocalDatabase(client, (line) => console.log(`  ${line}`));
    console.log(`${COMMAND} — done`);
  } finally {
    await client.end();
  }
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (error) {
    console.error(
      `${COMMAND} — ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
}
