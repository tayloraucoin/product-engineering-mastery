import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { findAuthDdl, scanMigrationsDir, touchesAuth } from "./auth-ddl.ts";
import { MIGRATIONS_DIR } from "./database.ts";

const AUTH_DDL = [
  "create schema if not exists auth",
  'alter table "auth"."users" add column "plan" text',
  "alter table auth.users enable row level security",
  "drop table auth.sessions",
  "create table auth.extra (id uuid)",
  "create index users_email_idx on auth.users (email)",
  "create trigger on_signup after insert on auth.users for each row execute function public.handle()",
  "create policy users_read on auth.users for select using (true)",
  "create or replace function auth.uid() returns uuid language sql as $$ select null::uuid $$",
  "drop function if exists auth.role",
  "grant select on auth.users to authenticated",
  "grant usage on schema auth to anon",
  "alter default privileges in schema auth grant all on tables to postgres",
  "comment on table auth.users is 'x'",
  "insert into auth.users (id, email) values (gen_random_uuid(), 'a@example.test')",
  "update auth.users set email = null",
  "delete from auth.users",
  "truncate auth.users",
];

const ALLOWED = [
  'ALTER TABLE "users" ADD CONSTRAINT "users_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action',
  'CREATE POLICY "notes_select_owner" ON "notes" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("notes"."owner_id" = (select auth.uid()))',
  'CREATE TABLE "public"."author"."x" (id uuid)',
  "select 'authentication' as word",
];

test("each kind of DDL or write against auth is caught", () => {
  for (const statement of AUTH_DDL) {
    assert.equal(touchesAuth(statement), true, statement);
  }
});

test("a foreign key to auth.users and a call to auth.uid() are allowed", () => {
  for (const statement of ALLOWED) {
    assert.equal(touchesAuth(statement), false, statement);
  }
});

test("a migration with DDL against auth fails, numbered by statement", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "check-migrations-"));
  writeFileSync(
    path.join(dir, "0001_bad.sql"),
    'CREATE TABLE "notes" ("id" uuid);\n--> statement-breakpoint\n-- a comment naming auth.users is ignored\nCREATE TRIGGER t AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.f();\n',
  );
  const { files, findings } = scanMigrationsDir(dir);
  assert.equal(files, 1);
  assert.equal(findings.length, 1);
  assert.equal(findings[0]?.file, "0001_bad.sql");
  assert.equal(findings[0]?.statement, 2);
});

test("the generated migration set passes, and it does reference auth.users", () => {
  const { files, findings } = scanMigrationsDir(MIGRATIONS_DIR);
  assert.ok(files > 0, "no generated migrations: run yarn db:generate");
  assert.deepEqual(findings, []);
  const all = readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith(".sql"))
    .map((name) => readFileSync(path.join(MIGRATIONS_DIR, name), "utf8"))
    .join("\n");
  assert.match(all, /REFERENCES "auth"\."users"/);
  assert.deepEqual(findAuthDdl("all", all), []);
});
