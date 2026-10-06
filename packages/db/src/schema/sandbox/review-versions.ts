/**
 * A sent review: each send is a new version, numbered per reviewer, and
 * Results read each reviewer's latest. The id is minted in the browser, so a
 * retried send lands once; it has no default. `triage` is keyed by comment
 * id, with "matters most".
 *
 * Retention: hard delete. Each version came through one access and cascades
 * from it; its two composite keys hold that the access is the reviewer's and
 * the slug is the reviewer's slug.
 */

import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { serviceOnlyPolicies } from "../../policies.ts";
import { sandboxAccesses } from "./accesses.ts";
import { slugIsValid } from "./columns.ts";
import { sandboxReviewers } from "./reviewers.ts";

/** The review's answers, keyed by question id; the review tickets type the values. */
export type SandboxAnswers = Record<string, unknown>;

/** Per comment id: what the reviewer made of it, and the one that matters most. */
export type SandboxTriage = {
  mattersMost?: string | null;
  comments?: Record<string, unknown>;
};

export const sandboxReviewVersions = pgTable(
  "sandbox_review_versions",
  {
    /** Minted in the browser; no default. */
    id: uuid("id").primaryKey(),
    reviewerId: uuid("reviewer_id").notNull(),
    accessId: uuid("access_id").notNull(),
    slug: text("slug").notNull(),
    /** 1, 2, 3 … per reviewer. */
    number: integer("number").notNull(),
    /** The config's coreVersion the questions came from (`v1`). */
    coreVersion: text("core_version").notNull(),
    answers: jsonb("answers").$type<SandboxAnswers>().notNull(),
    triage: jsonb("triage").$type<SandboxTriage>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("sandbox_review_versions_slug_check", slugIsValid(table.slug)),
    check("sandbox_review_versions_number_check", sql`${table.number} >= 1`),
    unique("sandbox_review_versions_reviewer_number_key").on(
      table.reviewerId,
      table.number,
    ),
    foreignKey({
      name: "sandbox_review_versions_access_fk",
      columns: [table.accessId, table.reviewerId],
      foreignColumns: [sandboxAccesses.id, sandboxAccesses.reviewerId],
    }).onDelete("cascade"),
    foreignKey({
      name: "sandbox_review_versions_reviewer_fk",
      columns: [table.reviewerId, table.slug],
      foreignColumns: [sandboxReviewers.id, sandboxReviewers.slug],
    }).onDelete("cascade"),
    index("sandbox_review_versions_access_idx").on(table.accessId),
    index("sandbox_review_versions_slug_idx").on(table.slug),
    ...serviceOnlyPolicies("sandbox_review_versions"),
  ],
);

export type SandboxReviewVersion = typeof sandboxReviewVersions.$inferSelect;
