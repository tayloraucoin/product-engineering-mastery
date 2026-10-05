/**
 * Every table drizzle-kit migrates, one file per table under
 * src/schema/<domain>/<table>.ts. Only tables in the public schema are listed;
 * nothing from Supabase's own schemas is re-exported (D-STK-5).
 */

export * from "./account/users.ts";
export * from "./notes/notes.ts";
export * from "./billing/stripe-events.ts";
