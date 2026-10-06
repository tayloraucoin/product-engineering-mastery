/**
 * A reviewer: one person on one experiment (D-LAB-6, D-LAB-37), holding one
 * live code at a time. The code is kept only as its SHA-256 (gate.md), unique
 * across every slug; replacing it rewrites the hash in place and raises
 * `code_version`, which shuts every access made with the old one (D-LAB-23).
 *
 * Retention: hard delete (D-LAB-36). Deleting a reviewer cascades to their
 * accesses, and through them to every view, comment and review version.
 * Erasing an email may revoke and relabel a reviewer left with no access
 * (data-contract.md); that is code (LAB-16), not SQL.
 */

import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { serviceOnlyPolicies } from "../../policies.ts";
import { bytea, slugIsValid } from "./columns.ts";

export const sandboxReviewers = pgTable(
  "sandbox_reviewers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** The experiment's config slug; never a foreign key (no experiments table). */
    slug: text("slug").notNull(),
    /** The team's name for the reviewer: often an email, scrubbed on erasure. */
    label: text("label").notNull(),
    /** The name shown to other reviewers in collaborate mode (beat 2); null in private mode. */
    displayName: text("display_name"),
    /** SHA-256 of the normalised code, unsalted (gate.md). */
    codeHash: bytea("code_hash").notNull().unique(),
    /** Starts at 1; raised each time the code is replaced in place. */
    codeVersion: integer("code_version").notNull().default(1),
    /** Set when the code is revoked; the gate then finds nothing. */
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    /** The design drawn at random on the first visit, then fixed (S15); a config design id. */
    firstDesign: text("first_design"),
    /** The design last viewed; later visits open on it. */
    lastDesign: text("last_design"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("sandbox_reviewers_slug_check", slugIsValid(table.slug)),
    check(
      "sandbox_reviewers_code_version_check",
      sql`${table.codeVersion} >= 1`,
    ),
    // The target of every child's (reviewer_id, slug) key: a row never claims another slug.
    unique("sandbox_reviewers_id_slug_key").on(table.id, table.slug),
    index("sandbox_reviewers_slug_idx").on(table.slug),
    ...serviceOnlyPolicies("sandbox_reviewers"),
  ],
);

export type SandboxReviewer = typeof sandboxReviewers.$inferSelect;
