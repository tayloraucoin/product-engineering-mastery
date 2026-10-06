/**
 * The gate's throttle (gap 3, gate.md): failures per hashed key in a short
 * window, and a lock once they run over. It holds no slug and no foreign key,
 * so a row says nothing about which experiment was tried, or by whom.
 *
 * Retention: each row expires within 30 minutes and is deleted in code
 * (LAB-6).
 */

import { sql } from "drizzle-orm";
import { check, integer, pgTable, timestamp } from "drizzle-orm/pg-core";

import { serviceOnlyPolicies } from "../../policies.ts";
import { bytea } from "./columns.ts";

export const sandboxGateAttempts = pgTable(
  "sandbox_gate_attempts",
  {
    /** A hash of what is throttled; never the raw key. */
    keyHash: bytea("key_hash").primaryKey(),
    failures: integer("failures").notNull().default(0),
    windowEndsAt: timestamp("window_ends_at", { withTimezone: true }).notNull(),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
  },
  (table) => [
    check(
      "sandbox_gate_attempts_failures_check",
      sql`${table.failures} >= 0`,
    ),
    ...serviceOnlyPolicies("sandbox_gate_attempts"),
  ],
);

export type SandboxGateAttempt = typeof sandboxGateAttempts.$inferSelect;
