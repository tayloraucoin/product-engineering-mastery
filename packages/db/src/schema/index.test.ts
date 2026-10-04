import assert from "node:assert/strict";
import { test } from "node:test";
import { getTableConfig, PgTable } from "drizzle-orm/pg-core";

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
