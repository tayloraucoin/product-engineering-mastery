/**
 * The record of actions (S12c): one row per team action on the sandbox, with
 * counts only. It never names a reviewer or a reviewer's email (D-LAB-28):
 * there is no reviewer column of any kind, so erasure never touches it.
 * `target_email` is set only on role changes, and holds a team member's.
 *
 * Retention: kept. `actor_user_id` is not a foreign key, so the record
 * outlives the account that made it.
 */

import { sql } from "drizzle-orm";
import {
  check,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { serviceOnlyPolicies } from "../../policies.ts";
import { slugIsValid } from "./columns.ts";

/** How many rows an action touched, by name; never who. */
export type SandboxActionCounts = Record<string, number>;

export const sandboxActions = pgTable(
  "sandbox_actions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
    actorUserId: uuid("actor_user_id").notNull(),
    actorEmail: text("actor_email").notNull(),
    action: text("action").notNull(),
    /** The experiment acted on; null for actions on no one experiment (role changes). */
    slug: text("slug"),
    /** Role changes only: the team member's email, never a reviewer's. */
    targetEmail: text("target_email"),
    counts: jsonb("counts").$type<SandboxActionCounts>(),
  },
  (table) => [
    check(
      "sandbox_actions_slug_check",
      sql`${table.slug} is null or ${slugIsValid(table.slug)}`,
    ),
    index("sandbox_actions_at_idx").on(table.at),
    ...serviceOnlyPolicies("sandbox_actions"),
  ],
);

export type SandboxAction = typeof sandboxActions.$inferSelect;
