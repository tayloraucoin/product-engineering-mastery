/**
 * The order log (S15): a `load` per page view and a `switch` per design
 * change, from which the first design, the switches and the time on each
 * design derive. Written only for reviewers, never for the team (D-LAB-14).
 *
 * Retention: hard delete. Each row came through one access and cascades from
 * it; its two composite keys hold that the access is the reviewer's and the
 * slug is the reviewer's slug.
 */

import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { serviceOnlyPolicies } from "../../policies.ts";
import { sandboxAccesses } from "./accesses.ts";
import { slugIsValid } from "./columns.ts";
import { sandboxReviewers } from "./reviewers.ts";

export const SANDBOX_VIEW_KINDS = ["load", "switch"] as const;
export type SandboxViewKind = (typeof SANDBOX_VIEW_KINDS)[number];

export const sandboxViewEvents = pgTable(
  "sandbox_view_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reviewerId: uuid("reviewer_id").notNull(),
    accessId: uuid("access_id").notNull(),
    slug: text("slug").notNull(),
    kind: text("kind", { enum: SANDBOX_VIEW_KINDS }).notNull(),
    /** The config's design id; never a foreign key. */
    design: text("design").notNull(),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("sandbox_view_events_slug_check", slugIsValid(table.slug)),
    check(
      "sandbox_view_events_kind_check",
      sql`${table.kind} in ('load', 'switch')`,
    ),
    foreignKey({
      name: "sandbox_view_events_access_fk",
      columns: [table.accessId, table.reviewerId],
      foreignColumns: [sandboxAccesses.id, sandboxAccesses.reviewerId],
    }).onDelete("cascade"),
    foreignKey({
      name: "sandbox_view_events_reviewer_fk",
      columns: [table.reviewerId, table.slug],
      foreignColumns: [sandboxReviewers.id, sandboxReviewers.slug],
    }).onDelete("cascade"),
    index("sandbox_view_events_access_idx").on(table.accessId),
    index("sandbox_view_events_reviewer_at_idx").on(table.reviewerId, table.at),
    ...serviceOnlyPolicies("sandbox_view_events"),
  ],
);

export type SandboxViewEvent = typeof sandboxViewEvents.$inferSelect;
