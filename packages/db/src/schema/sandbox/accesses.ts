/**
 * An access: one gate entry per device (D-LAB-37, S8). It records the email
 * given at the gate, or the signed-in reviewer's user id, never both, and
 * the `code_version` it was made with. "Emails used" is the distinct emails.
 *
 * Retention: hard delete. Erasure works by access, not by reviewer: deleting
 * an access cascades to every view, comment and review version that came
 * through it, and keeps the same reviewer's rows from their other accesses
 * (data-contract.md, "Each is erased separately"). Deleting the reviewer, or
 * the signed-in reviewer's account, deletes the access.
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
import { users } from "../account/users.ts";
import { sandboxReviewers } from "./reviewers.ts";

export const sandboxAccesses = pgTable(
  "sandbox_accesses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reviewerId: uuid("reviewer_id")
      .notNull()
      .references(() => sandboxReviewers.id, { onDelete: "cascade" }),
    /** The email given at the gate, lower-cased and trimmed by the caller. */
    email: text("email"),
    /** A signed-in reviewer's account; erasing the account erases the access. */
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    /** The reviewer's code_version when this entry was made; a raised version shuts it. */
    codeVersion: integer("code_version").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "sandbox_accesses_one_identity_check",
      sql`(${table.email} is null) <> (${table.userId} is null)`,
    ),
    // The target of every child's (access_id, reviewer_id) key: a row's access is its reviewer's.
    unique("sandbox_accesses_id_reviewer_key").on(table.id, table.reviewerId),
    index("sandbox_accesses_reviewer_idx").on(table.reviewerId),
    index("sandbox_accesses_email_idx").on(table.email),
    index("sandbox_accesses_user_idx").on(table.userId),
    ...serviceOnlyPolicies("sandbox_accesses"),
  ],
);

export type SandboxAccess = typeof sandboxAccesses.$inferSelect;
