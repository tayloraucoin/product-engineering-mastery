/**
 * What the seven sandbox_ tables share (LAB-1, data-contract.md): the slug's
 * SQL check and a bytea column. There is no experiments table, so a slug is
 * text checked here on every table that holds one; it names an experiment's
 * config and never changes once it holds data.
 */

import { sql, type SQL } from "drizzle-orm";
import { customType, type AnyPgColumn } from "drizzle-orm/pg-core";

/** At most 48 characters: lower-case words joined by single hyphens. */
export const SANDBOX_SLUG_PATTERN = "^[a-z0-9]+(-[a-z0-9]+)*$";
export const SANDBOX_SLUG_MAX = 48;

/**
 * The slug check's SQL. `sql.raw` is safe only because both operands are the
 * module constants above: never pass it a value.
 */
export function slugIsValid(column: AnyPgColumn): SQL {
  return sql`(${column} ~ ${sql.raw(`'${SANDBOX_SLUG_PATTERN}'`)} and char_length(${column}) <= ${sql.raw(String(SANDBOX_SLUG_MAX))})`;
}

/** Raw bytes; drizzle 0.45 has no bytea builder. postgres.js reads it as a Buffer. */
export const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => "bytea",
});
