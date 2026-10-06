/**
 * drizzle-kit's config (D-STK-5). `db:generate` reads the schema and writes
 * SQL into migrations/ without a database. Only tables exported from
 * src/schema/index.ts are generated; `authUsers` is imported there as a
 * foreign-key target and never exported, so no DDL against auth is written,
 * and `yarn check-migrations` fails if any appears. Introspection is held to
 * the public schema and Supabase's own roles are left alone.
 */

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./migrations",
  schemaFilter: ["public"],
  entities: { roles: { provider: "supabase" } },
  strict: true,
  verbose: true,
});
