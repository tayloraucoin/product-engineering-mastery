import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { safeNextPath } from "@pem/auth/redirect";

import {
  adminGate,
  isTeamActionRefusal,
  requireTeamActionWith,
  TEAM_ACTION_REFUSED,
} from "./admin-gate.ts";
import { getTeamMemberWith, teamMemberOf } from "./team-check.ts";

const userId = "00000000-0000-4000-8000-000000000001";
const PATHS = [
  "/admin",
  "/admin/experiments/pricing-2026",
  "/admin/people",
] as const;

const developer = teamMemberOf({
  userId,
  email: "dev@example.test",
  role: "developer",
});
const admin = teamMemberOf({ userId, email: "ana@example.com", role: "admin" });
/** A signed-in user, with or without an experiment's code: the code never reaches the team check. */
const user = teamMemberOf({ userId, email: "ben@example.com", role: "user" });

test("C1: with no session, each path goes to sign-in with next set to it, and safeNextPath gives it back", () => {
  for (const path of PATHS) {
    const gate = adminGate({ member: null, signedIn: false, path });
    assert.equal(gate.kind, "sign-in");
    const url = new URL(
      (gate as { url: string }).url,
      "https://app.example.test",
    );
    assert.equal(url.pathname, "/auth/sign-in");
    assert.equal(url.searchParams.get("next"), path);
    assert.equal(safeNextPath(url.searchParams.get("next")), path);
  }
});

test("C1: a layout with no session renders bare, so the page's own redirect carries next", () => {
  assert.deepEqual(adminGate({ member: null, signedIn: false, path: null }), {
    kind: "bare",
  });
});

test("C1: a next that is not a same-origin path is never put in the sign-in link", () => {
  const gate = adminGate({
    member: null,
    signedIn: false,
    path: "//evil.example",
  });
  assert.equal(
    new URL(
      (gate as { url: string }).url,
      "https://app.example.test",
    ).searchParams.get("next"),
    "/",
  );
});

test("C2: a signed-in user gets not-found on every path, from a page or a layout, with or without a code", () => {
  assert.equal(user, null, "a user is never a team member");
  for (const path of [...PATHS, null])
    for (const adminOnly of [false, true])
      assert.deepEqual(
        adminGate({ member: user, signedIn: true, path, adminOnly }),
        { kind: "not-found" },
      );
});

test("C2: a code alone makes no team member: with no session the team check is null", async () => {
  // A code holder has the sandbox_access cookie and no session; the check reads only the session.
  assert.equal(await getTeamMemberWith(async () => null), null);
  for (const file of ["admin-gate.ts", "admin-guard.ts"]) {
    const source = readFileSync(new URL(file, import.meta.url), "utf8");
    assert.doesNotMatch(source, /sandbox_access|cookies\(|from "\.\/cookie/);
  }
});

test("C3: adminGate gives a developer not-found on an admin-only path, and the team view elsewhere", () => {
  assert.deepEqual(
    adminGate({
      member: developer,
      signedIn: true,
      path: "/admin/people",
      adminOnly: true,
    }),
    { kind: "not-found" },
  );
  assert.deepEqual(
    adminGate({ member: developer, signedIn: true, path: "/admin" }),
    { kind: "team", member: developer },
  );
  for (const path of [...PATHS, null])
    assert.deepEqual(
      adminGate({ member: admin, signedIn: true, path, adminOnly: true }),
      { kind: "team", member: admin },
    );
});

/** A synthetic /admin action: the guard, then the work. */
function syntheticAction(
  getMember: () => Promise<ReturnType<typeof teamMemberOf>>,
  adminOnly: boolean,
) {
  let worked = 0;
  const action = async () => {
    const member = await requireTeamActionWith(getMember, { adminOnly });
    if (isTeamActionRefusal(member)) return member;
    worked += 1;
    return { outcome: "done" as const };
  };
  return { action, worked: () => worked };
}

test("C4: requireTeamAction refuses no session (a code holder included), a user, and a developer when admin-only, with one fixed refusal and no work", async () => {
  const refused = [
    { name: "no session", member: null, adminOnly: false },
    { name: "a code holder", member: null, adminOnly: true },
    { name: "a user", member: user, adminOnly: false },
    {
      name: "a developer on an admin-only action",
      member: developer,
      adminOnly: true,
    },
  ];
  for (const { name, member, adminOnly } of refused) {
    const { action, worked } = syntheticAction(async () => member, adminOnly);
    const result = await action();
    assert.equal(result, TEAM_ACTION_REFUSED, name);
    assert.deepEqual(result, { outcome: "refused" }, name);
    assert.equal(worked(), 0, `${name}: work was done`);
  }
  assert.ok(Object.isFrozen(TEAM_ACTION_REFUSED));
});

test("C4: a developer passes a team action, and an admin passes both", async () => {
  for (const [member, adminOnly] of [
    [developer, false],
    [admin, false],
    [admin, true],
  ] as const) {
    const { action, worked } = syntheticAction(async () => member, adminOnly);
    assert.deepEqual(await action(), { outcome: "done" });
    assert.equal(worked(), 1);
  }
});

test("C3: a path under People is admin-only even when the caller forgets to say so", () => {
  for (const path of ["/admin/people", "/admin/people/anything"])
    assert.deepEqual(adminGate({ member: developer, signedIn: true, path }), {
      kind: "not-found",
    });
  assert.deepEqual(
    adminGate({ member: developer, signedIn: true, path: "/admin/peoplex" }),
    { kind: "team", member: developer },
  );
});
