import assert from "node:assert/strict";
import { test } from "node:test";
import { getTableConfig, PgDialect, PgTable } from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";

import * as schema from "./index.ts";

const tables = Object.values(schema as Record<string, unknown>).filter(
  (value): value is PgTable => value instanceof PgTable,
);

test("the schema exports tables, and none of them outside public", () => {
  assert.ok(tables.length > 0);
  for (const table of tables) {
    const { name, schema: pgSchema } = getTableConfig(table);
    assert.equal(pgSchema, undefined, `${name} must live in public`);
  }
});

test("authUsers is never exported from the schema", () => {
  assert.ok(!("authUsers" in schema));
});

test("every table carries its policies beside it", () => {
  for (const table of tables) {
    const { name, policies } = getTableConfig(table);
    assert.ok(policies.length > 0, `${name} has no policies`);
  }
});

const dialect = new PgDialect();

const SANDBOX_TABLES = [
  "sandbox_reviewers",
  "sandbox_accesses",
  "sandbox_view_events",
  "sandbox_comments",
  "sandbox_review_versions",
  "sandbox_actions",
  "sandbox_gate_attempts",
];

const configOf = (name: string) => {
  const table = tables.find((t) => getTableConfig(t).name === name);
  assert.ok(table, `${name} is not exported`);
  return getTableConfig(table);
};

test("C1: the seven sandbox_ tables are exported, in public, and service-only (LAB-1)", () => {
  const exported = tables
    .map((t) => getTableConfig(t).name)
    .filter((name) => name.startsWith("sandbox_"));
  assert.deepEqual([...exported].sort(), [...SANDBOX_TABLES].sort());
  for (const name of SANDBOX_TABLES) {
    const { schema: pgSchema, policies } = configOf(name);
    assert.equal(pgSchema, undefined, `${name} must live in public`);
    assert.equal(policies.length, 1, `${name} must carry serviceOnlyPolicies and nothing else`);
    const [policy] = policies;
    assert.equal(policy!.name, `${name}_all_denied`);
    assert.equal(policy!.for, "all");
    assert.equal(policy!.to, authenticatedRole);
    assert.equal(dialect.sqlToQuery(policy!.using!).sql, "false");
    assert.equal(dialect.sqlToQuery(policy!.withCheck!).sql, "false");
  }
});

test("C1: sandbox_actions has no reviewer column of any kind (D-LAB-28)", () => {
  const { columns, foreignKeys } = configOf("sandbox_actions");
  const names = columns.map((c) => c.name);
  for (const name of names)
    assert.doesNotMatch(name, /reviewer|access|label|display/, `${name} names a reviewer`);
  assert.deepEqual(foreignKeys, []);
});

test("C1: sandbox_gate_attempts has no slug and no foreign key (gap 3)", () => {
  const { columns, foreignKeys } = configOf("sandbox_gate_attempts");
  assert.deepEqual(
    columns.map((c) => c.name).sort(),
    ["failures", "key_hash", "locked_until", "window_ends_at"],
  );
  assert.deepEqual(foreignKeys, []);
});

test("C1: comment and review-version ids have no default; the browser mints them", () => {
  for (const name of ["sandbox_comments", "sandbox_review_versions"]) {
    const id = configOf(name).columns.find((c) => c.name === "id");
    assert.ok(id?.primary, `${name}.id is the primary key`);
    assert.equal(id.hasDefault, false, `${name}.id must have no default`);
  }
  const parent = configOf("sandbox_comments").columns.find(
    (c) => c.name === "parent_id",
  );
  assert.ok(parent, "sandbox_comments.parent_id ships now");
  const parentKeys = configOf("sandbox_comments").foreignKeys.filter((fk) =>
    fk.reference().columns.some((c) => c.name === "parent_id"),
  );
  assert.deepEqual(parentKeys, [], "parent_id has no foreign key");
});
