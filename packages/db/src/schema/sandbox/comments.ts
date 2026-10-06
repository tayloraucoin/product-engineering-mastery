/**
 * A pin on a design (S17), or a team note. The id is minted in the browser,
 * so a retried insert lands once (`on conflict do nothing`); it has no
 * default. The author is either a reviewer, through one access, or a team
 * member; a check holds exactly one. `parent_id` (threads, beat 2) has no
 * foreign key: a reply points at its root, one level, and copies the root's
 * `design` and `anchor`, so it still knows where "Comment removed" goes
 * after its root is hard-deleted (data-contract.md).
 *
 * Retention: hard delete. A reviewer's comment cascades from its access; a
 * team note from its author's account. Undo re-inserts under the same id.
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
  uuid,
} from "drizzle-orm/pg-core";

import { serviceOnlyPolicies } from "../../policies.ts";
import { users } from "../account/users.ts";
import { sandboxAccesses } from "./accesses.ts";
import { slugIsValid } from "./columns.ts";
import { sandboxReviewers } from "./reviewers.ts";

export const SANDBOX_COMMENT_KINDS = [
  "problem",
  "question",
  "suggestion",
  "keep",
] as const;
export type SandboxCommentKind = (typeof SANDBOX_COMMENT_KINDS)[number];

export const SANDBOX_COMMENT_BODY_MAX = 2000;

/** Where a pin sits: the marked element (or its id or path) and the x and y fractions inside it. */
export type SandboxAnchor = {
  marked?: string;
  id?: string;
  path?: string;
  x: number;
  y: number;
};

export const sandboxComments = pgTable(
  "sandbox_comments",
  {
    /** Minted in the browser; no default. */
    id: uuid("id").primaryKey(),
    slug: text("slug").notNull(),
    /** The config's design id; never a foreign key. */
    design: text("design").notNull(),
    /** The pin's number as the author sees it. */
    number: integer("number").notNull(),
    kind: text("kind", { enum: SANDBOX_COMMENT_KINDS }),
    body: text("body").notNull(),
    anchor: jsonb("anchor").$type<SandboxAnchor>().notNull(),
    viewportW: integer("viewport_w").notNull(),
    viewportH: integer("viewport_h").notNull(),
    clientCreatedAt: timestamp("client_created_at", {
      withTimezone: true,
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    /** A reviewer's comment: reviewer_id and access_id together. */
    reviewerId: uuid("reviewer_id"),
    accessId: uuid("access_id"),
    /** A team note: its author's account. */
    teamUserId: uuid("team_user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    /** The thread's root (beat 2); no foreign key, so a reply outlives its root. */
    parentId: uuid("parent_id"),
  },
  (table) => [
    check("sandbox_comments_slug_check", slugIsValid(table.slug)),
    check(
      "sandbox_comments_kind_check",
      sql`${table.kind} is null or ${table.kind} in ('problem', 'question', 'suggestion', 'keep')`,
    ),
    check(
      "sandbox_comments_body_check",
      sql`char_length(${table.body}) <= ${sql.raw(String(SANDBOX_COMMENT_BODY_MAX))}`,
    ),
    check(
      "sandbox_comments_one_author_check",
      sql`(${table.reviewerId} is not null and ${table.accessId} is not null and ${table.teamUserId} is null) or (${table.reviewerId} is null and ${table.accessId} is null and ${table.teamUserId} is not null)`,
    ),
    foreignKey({
      name: "sandbox_comments_access_fk",
      columns: [table.accessId, table.reviewerId],
      foreignColumns: [sandboxAccesses.id, sandboxAccesses.reviewerId],
    }).onDelete("cascade"),
    foreignKey({
      name: "sandbox_comments_reviewer_fk",
      columns: [table.reviewerId, table.slug],
      foreignColumns: [sandboxReviewers.id, sandboxReviewers.slug],
    }).onDelete("cascade"),
    index("sandbox_comments_slug_reviewer_idx").on(table.slug, table.reviewerId),
    index("sandbox_comments_access_idx").on(table.accessId),
    index("sandbox_comments_parent_idx").on(table.parentId),
    ...serviceOnlyPolicies("sandbox_comments"),
  ],
);

export type SandboxComment = typeof sandboxComments.$inferSelect;
