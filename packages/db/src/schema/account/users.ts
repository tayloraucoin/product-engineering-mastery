/**
 * The application's user row, one per Supabase auth user (D-STK-5). Its id is
 * the auth user's id; the auth trigger in supabase/setup creates the row and
 * deleting the auth user deletes it. `authUsers` is imported only as the
 * foreign-key target and never exported, so drizzle-kit writes no DDL against
 * the auth schema.
 */

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";

import { ownerRowPolicies } from "../../policies.ts";

export const users = pgTable(
  "users",
  {
    id: uuid("id")
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    email: text("email"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ownerRowPolicies("users", table.id),
);

export type User = typeof users.$inferSelect;
