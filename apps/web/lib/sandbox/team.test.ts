import assert from "node:assert/strict";
import { test } from "node:test";

import { getTeamMemberWith, teamMemberOf } from "./team-check.ts";

const userId = "00000000-0000-4000-8000-000000000001";

test("C5: teamMemberOf returns the user id, email and role for a developer and for an admin (LAB-2)", () => {
  for (const role of ["developer", "admin"] as const) {
    assert.deepEqual(
      teamMemberOf({ userId, email: "team@example.test", role }),
      { userId, email: "team@example.test", role },
    );
  }
});

test("C5: teamMemberOf returns null for a user and for no session (LAB-2)", () => {
  assert.equal(
    teamMemberOf({ userId, email: "user@example.test", role: "user" }),
    null,
  );
  assert.equal(teamMemberOf(null), null);
});

test("C5: a team member with no email is null: the record of actions needs one (LAB-2)", () => {
  assert.equal(teamMemberOf({ userId, email: null, role: "admin" }), null);
  assert.equal(teamMemberOf({ userId, email: "", role: "developer" }), null);
});

test("C5: an unexpected role string never passes (LAB-2)", () => {
  assert.equal(
    teamMemberOf({
      userId,
      email: "x@example.test",
      role: "owner" as unknown as "user",
    }),
    null,
  );
});

test("C5: getTeamMemberWith reads the context it is given on every call, and caches nothing (LAB-2)", async () => {
  const contexts = [
    { userId, email: "team@example.test", role: "admin" as const },
    { userId, email: "team@example.test", role: "user" as const },
  ];
  let calls = 0;
  const next = async () => contexts[calls++] ?? null;
  assert.deepEqual(await getTeamMemberWith(next), {
    userId,
    email: "team@example.test",
    role: "admin",
  });
  // The same person demoted: the next request is no longer a team member.
  assert.equal(await getTeamMemberWith(next), null);
  assert.equal(calls, 2);
});
