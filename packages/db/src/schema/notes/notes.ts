/**
 * The example owned table (D-STK-5): a note only its owner can read or write.
 * A product replaces it with its own domain; the shape to keep is the owner
 * column and the policy factory beside the columns.
 */

import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { ownerPrivatePolicies } from "../../policies.ts";
import { users } from "../account/users.ts";

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("notes_owner_id_idx").on(table.ownerId),
    ...ownerPrivatePolicies("notes", table.ownerId),
  ],
);

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
