import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { PgDialect } from "drizzle-orm/pg-core";

import { sandboxComments } from "../schema/sandbox/comments.ts";
import {
  isUuid,
  NOT_A_REVIEWER_VIEWER,
  NOT_A_TEAM_VIEWER,
  NOT_AN_ADMIN_VIEWER,
  requireAdmin,
  requireTeam,
  reviewerScope,
  type Viewer,
} from "./viewer.ts";

const reviewer: Viewer = {
  kind: "reviewer",
  slug: "pricing-2026",
  reviewerId: "00000000-0000-4000-8000-000000000001",
  accessId: "00000000-0000-4000-8000-000000000002",
};
const developer: Viewer = {
  kind: "team",
  userId: "00000000-0000-4000-8000-000000000003",
  email: "dev@example.test",
  role: "developer",
};
const admin: Viewer = { ...developer, role: "admin" };

test("requireTeam refuses a reviewer and admits a developer and an admin", () => {
  assert.throws(() => requireTeam(reviewer), { message: NOT_A_TEAM_VIEWER });
  assert.equal(requireTeam(developer), developer);
  assert.equal(requireTeam(admin), admin);
  // A team viewer without a real user id or an email is refused.
  for (const forged of [
    { ...developer, userId: "" },
    { ...developer, userId: "not-a-uuid" },
    { ...developer, email: "" },
  ])
    assert.throws(() => requireTeam(forged), { message: NOT_A_TEAM_VIEWER });
  // A forged role on a team viewer is still refused.
  assert.throws(
    () => requireTeam({ ...developer, role: "user" as unknown as "admin" }),
    { message: NOT_A_TEAM_VIEWER },
  );
});

test("requireAdmin refuses a reviewer and a developer", () => {
  assert.throws(() => requireAdmin(reviewer), { message: NOT_A_TEAM_VIEWER });
  assert.throws(() => requireAdmin(developer), {
    message: NOT_AN_ADMIN_VIEWER,
  });
  assert.equal(requireAdmin(admin), admin);
});

test("reviewerScope filters by the viewer's reviewer id and slug, and refuses the team", () => {
  const { sql, params } = new PgDialect().sqlToQuery(
    reviewerScope(reviewer, sandboxComments),
  );
  assert.equal(
    sql,
    '("sandbox_comments"."reviewer_id" = $1 and "sandbox_comments"."slug" = $2)',
  );
  assert.deepEqual(params, [
    "00000000-0000-4000-8000-000000000001",
    "pricing-2026",
  ]);
  assert.throws(() => reviewerScope(admin, sandboxComments), {
    message: NOT_A_REVIEWER_VIEWER,
  });
});

test("isUuid accepts a UUID and nothing else", () => {
  assert.ok(isUuid("00000000-0000-4000-8000-000000000001"));
  for (const bad of ["", "x", "00000000-0000-4000-8000-00000000000", 1, null])
    assert.ok(!isUuid(bad));
});

test("the module imports neither next nor react, and never the getDb singleton", () => {
  const dir = new URL(".", import.meta.url);
  for (const file of readdirSync(dir).filter(
    (name) => name.endsWith(".ts") && !name.endsWith(".test.ts"),
  )) {
    const text = readFileSync(new URL(file, dir), "utf8");
    assert.doesNotMatch(text, /from "(next|react)(\/[^"]*)?"/, file);
    // db is always an argument: no singleton, and no client of its own.
    assert.doesNotMatch(text, /\b(getDb|createDb|closeDb)\b/, file);
  }
});
