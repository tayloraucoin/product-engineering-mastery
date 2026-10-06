/**
 * Finds statements in a migration that act on Supabase's `auth` schema
 * (D-STK-5). Supabase owns that schema; a migration may point a foreign key at
 * `auth.users` and call auth's functions inside an expression, and nothing
 * else. Creating, altering, dropping, granting, commenting, triggering,
 * indexing or writing anything in `auth` belongs in supabase/setup, which runs
 * by hand and is reviewed as SQL.
 */

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export type AuthDdlFinding = {
  file: string;
  statement: number;
  text: string;
};

const AUTH_NAME = String.raw`(?:"auth"|\bauth)\s*\.\s*(?:"[^"]+"|[a-z_][a-z0-9_$]*)`;

/** `auth` named as a schema: create, alter, drop, grant on, or default privileges in. */
const AUTH_SCHEMA =
  /\bschema\s+(?:if\s+(?:not\s+)?exists\s+)?(?:"auth"|auth)\b/i;

/** A function or procedure in auth being defined, altered, dropped, granted or commented. */
const AUTH_ROUTINE = new RegExp(
  String.raw`\b(?:function|procedure|routine)\s+(?:if\s+exists\s+)?${AUTH_NAME}`,
  "i",
);

/** The two reads a migration may make of auth: a foreign-key target, and a call to one of its argument-free functions such as auth.uid(). */
const ALLOWED = [
  new RegExp(String.raw`\breferences\s+${AUTH_NAME}`, "gi"),
  new RegExp(String.raw`${AUTH_NAME}\s*\(\s*\)`, "gi"),
];

const ANY_AUTH_NAME = new RegExp(AUTH_NAME, "i");

/** The SQL with comments removed, cut into statements on `;` and drizzle's breakpoints. */
export function splitStatements(sql: string): string[] {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/--[^\n]*/g, " ")
    .split(/;/)
    .map((statement) => statement.replace(/\s+/g, " ").trim())
    .filter((statement) => statement !== "");
}

/** Whether one statement acts on the auth schema. */
export function touchesAuth(statement: string): boolean {
  if (AUTH_SCHEMA.test(statement) || AUTH_ROUTINE.test(statement)) return true;
  const rest = ALLOWED.reduce(
    (text, allowed) => text.replace(allowed, " "),
    statement,
  );
  return ANY_AUTH_NAME.test(rest);
}

/** Every statement in `sql` that acts on auth, numbered from 1. */
export function findAuthDdl(file: string, sql: string): AuthDdlFinding[] {
  return splitStatements(sql).flatMap((text, index) =>
    touchesAuth(text) ? [{ file, statement: index + 1, text }] : [],
  );
}

/** Every finding across the .sql files directly in `dir`, and how many files were read. */
export function scanMigrationsDir(dir: string): {
  files: number;
  findings: AuthDdlFinding[];
} {
  const files = readdirSync(dir)
    .filter((name) => name.endsWith(".sql"))
    .sort();
  return {
    files: files.length,
    findings: files.flatMap((name) =>
      findAuthDdl(name, readFileSync(path.join(dir, name), "utf8")),
    ),
  };
}
