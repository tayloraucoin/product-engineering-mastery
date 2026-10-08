import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

import {
  adminGate,
  requireTeamActionWith,
  TEAM_ACTION_REFUSED,
} from "./admin-gate.ts";
import { adminNavFor } from "./admin-nav.ts";
import {
  changeRoleWith,
  filterPeople,
  matchAnnouncement,
  PEOPLE_FIXTURE_VIEWER,
  PEOPLE_STATE_KEYS,
  PEOPLE_WORDS,
  peopleRows,
  peopleStateView,
  roleChangeConfirmation,
  type AuthPerson,
  type ChangeRoleDeps,
} from "./people.ts";
import { readSandboxState, SANDBOX_STATE_KEYS } from "./state.ts";
import type { TeamMember } from "./team-check.ts";

const ANA = "00000000-0000-4000-8000-0000000000a1";
const BEN = "00000000-0000-4000-8000-0000000000b2";
const CAL = "00000000-0000-4000-8000-0000000000c3";

const ana: TeamMember = {
  userId: ANA,
  email: "ana@example.com",
  role: "admin",
};

function person(
  id: string,
  email: string,
  role?: string,
  extra: Record<string, unknown> = {},
): AuthPerson {
  return {
    id,
    email,
    appMetadata: {
      provider: "email",
      providers: ["email"],
      ...(role ? { role } : {}),
      ...extra,
    },
    createdAt: "2026-09-01T09:00:00Z",
    lastSignInAt: "2026-10-01T09:00:00Z",
  };
}

/**
 * The Auth API and the record in memory. `withLock` behaves as the
 * transaction does: the records `fn` writes land only if `fn` returns.
 */
function world(people: AuthPerson[], { failWrite = false } = {}) {
  const users = new Map(people.map((p) => [p.id, structuredClone(p)]));
  const records: { tx: number; email: string }[] = [];
  const writes: { userId: string; appMetadata: Record<string, unknown> }[] = [];
  const calls: string[] = [];
  let txs = 0;
  const deps: ChangeRoleDeps<number> = {
    async withLock(fn) {
      calls.push("lock");
      const tx = ++txs;
      const before = records.length;
      try {
        return await fn(tx);
      } catch (error) {
        records.splice(before);
        throw error;
      }
    },
    async readPerson(userId) {
      calls.push("read");
      return structuredClone(users.get(userId) ?? null);
    },
    async countAdmins() {
      calls.push("count");
      return [...users.values()].filter((u) => u.appMetadata.role === "admin")
        .length;
    },
    async writeAppMetadata(userId, appMetadata) {
      calls.push("write");
      if (failWrite) throw new Error("Auth API down");
      writes.push({ userId, appMetadata });
      users.get(userId)!.appMetadata = appMetadata;
    },
    async recordRoleChange(tx, email) {
      calls.push("record");
      records.push({ tx, email });
    },
  };
  return { deps, users, records, writes, calls };
}

describe("C1: an admin makes a user a developer", () => {
  test("C1: app_metadata.role is written, other keys kept, one record names the user, and the toast says so", async () => {
    const w = world([
      person(ANA, "ana@example.com", "admin"),
      person(BEN, "Ben@Example.com", undefined, { custom: 1 }),
    ]);
    const result = await changeRoleWith(w.deps, ana, {
      userId: BEN,
      role: "developer",
    });
    assert.deepEqual(result, {
      outcome: "changed",
      message: "ben@example.com is now a developer.",
      userId: BEN,
      role: "developer",
      self: false,
    });
    assert.deepEqual(w.writes, [
      {
        userId: BEN,
        appMetadata: {
          provider: "email",
          providers: ["email"],
          custom: 1,
          role: "developer",
        },
      },
    ]);
    assert.deepEqual(w.records, [{ tx: 1, email: "ben@example.com" }]);
    assert.deepEqual(w.calls, ["lock", "read", "record", "write"]);
  });

  test("C1: for an admin the nav's People entry is a link", () => {
    const people = adminNavFor("admin").find((e) => e.title === "People");
    assert.equal(people?.ready, true);
    assert.equal(people?.href, "/admin/people");
  });

  test("C1: each target role gets people.md's toast", async () => {
    for (const [role, message] of [
      ["admin", "ben@example.com is now an admin."],
      ["user", "ben@example.com's role was removed."],
    ] as const) {
      const w = world([
        person(ANA, "ana@example.com", "admin"),
        person(BEN, "ben@example.com", "developer"),
      ]);
      const result = await changeRoleWith(w.deps, ana, { userId: BEN, role });
      assert.equal(result.outcome, "changed");
      assert.equal((result as { message: string }).message, message);
    }
  });

  test("C1: a failed write leaves no record and gives the fixed failure", async () => {
    const w = world(
      [person(ANA, "ana@example.com", "admin"), person(BEN, "ben@example.com")],
      { failWrite: true },
    );
    assert.deepEqual(
      await changeRoleWith(w.deps, ana, { userId: BEN, role: "developer" }),
      { outcome: "failed", message: "The role wasn't changed. Try again." },
    );
    assert.deepEqual(w.records, []);
  });

  test("an unknown user, a missing email or a malformed input changes nothing", async () => {
    const w = world([
      person(ANA, "ana@example.com", "admin"),
      { ...person(BEN, ""), email: null },
    ]);
    assert.equal(
      (await changeRoleWith(w.deps, ana, { userId: CAL, role: "developer" }))
        .outcome,
      "failed",
    );
    assert.equal(
      (await changeRoleWith(w.deps, ana, { userId: BEN, role: "developer" }))
        .outcome,
      "failed",
    );
    for (const input of [
      null,
      "x",
      { userId: "not-a-uuid", role: "admin" },
      { userId: BEN, role: "owner" },
      { userId: BEN },
    ])
      assert.deepEqual(await changeRoleWith(w.deps, ana, input), {
        outcome: "refused",
      });
    assert.deepEqual(w.writes, []);
    assert.deepEqual(w.records, []);
  });
});

describe("C2: the last admin", () => {
  test("C2: the only admin lowering their own role by a direct call is refused, nothing written or recorded", async () => {
    for (const role of ["developer", "user"] as const) {
      const w = world([
        person(ANA, "ana@example.com", "admin"),
        person(BEN, "ben@example.com", "developer"),
      ]);
      assert.deepEqual(
        await changeRoleWith(w.deps, ana, { userId: ANA, role }),
        {
          outcome: "last-admin",
          message: "You're the only admin. Make someone else an admin first.",
        },
      );
      assert.deepEqual(w.writes, []);
      assert.deepEqual(w.records, []);
      // Counted inside the lock, from the Auth API.
      assert.deepEqual(w.calls, ["lock", "read", "count"]);
    }
  });

  test("C2: with a second admin the same change succeeds, and says it was the actor's own", async () => {
    const w = world([
      person(ANA, "ana@example.com", "admin"),
      person(BEN, "ben@example.com", "admin"),
    ]);
    const result = await changeRoleWith(w.deps, ana, {
      userId: ANA,
      role: "developer",
    });
    assert.equal(result.outcome, "changed");
    assert.equal((result as { self: boolean }).self, true);
    assert.equal(w.users.get(ANA)!.appMetadata.role, "developer");
    assert.deepEqual(w.records, [{ tx: 1, email: "ana@example.com" }]);
  });

  test("C2: the row marks your select locked when you are the only admin, and only then", () => {
    const solo = peopleRows(
      [person(ANA, "ana@example.com", "admin"), person(BEN, "ben@example.com")],
      ANA,
    );
    assert.deepEqual(
      solo.map((r) => [r.email, r.isYou, r.locked]),
      [
        ["ana@example.com", true, true],
        ["ben@example.com", false, false],
      ],
    );
    const pair = peopleRows(
      [
        person(ANA, "ana@example.com", "admin"),
        person(BEN, "ben@example.com", "admin"),
      ],
      ANA,
    );
    assert.equal(pair[0]!.locked, false);
  });
});

describe("C3: no one but an admin changes a role", () => {
  const developer: TeamMember = {
    userId: BEN,
    email: "ben@example.com",
    role: "developer",
  };
  const refusedFor: [string, TeamMember | null][] = [
    ["a developer", developer],
    ["a user", null],
    ["a code holder with no session", null],
  ];

  test("C3: a developer, a user and a code holder calling changeRole are refused with nothing written", async () => {
    for (const [who, member] of refusedFor) {
      const w = world([
        person(ANA, "ana@example.com", "admin"),
        person(CAL, "cal@example.com"),
      ]);
      // The action's first two statements, then the call it guards.
      const guard = await requireTeamActionWith(async () => member, {
        adminOnly: true,
      });
      assert.equal(guard, TEAM_ACTION_REFUSED, who);
      assert.deepEqual(w.calls, [], who);
    }
    // And the core refuses a developer on its own, before any lock or read.
    const w = world([person(CAL, "cal@example.com")]);
    assert.deepEqual(
      await changeRoleWith(w.deps, developer, { userId: CAL, role: "admin" }),
      { outcome: "refused" },
    );
    assert.deepEqual(w.calls, []);
  });

  test("C3: the action passes adminOnly and returns the refusal", () => {
    const source = readFileSync(
      new URL("../../app/admin/people/actions.ts", import.meta.url),
      "utf8",
    );
    assert.match(source, /await requireTeamAction\(\{ adminOnly: true \}\)/);
    assert.match(source, /if \(isTeamActionRefusal\(member\)\) return member;/);
  });

  test("C3: a developer on /admin/people gets not-found, and the page asks for an admin", () => {
    assert.deepEqual(
      adminGate({
        member: developer,
        signedIn: true,
        path: "/admin/people",
        adminOnly: true,
      }),
      { kind: "not-found" },
    );
    const page = readFileSync(
      new URL("../../app/admin/people/page.tsx", import.meta.url),
      "utf8",
    );
    assert.match(
      page,
      /await requireTeamPage\("\/admin\/people", \{ adminOnly: true \}\)/,
    );
  });
});

describe("people.md's words and states", () => {
  test("C6: each confirmation names its consequence and button", () => {
    assert.deepEqual(
      roleChangeConfirmation("ana@example.com", "user", "admin", false),
      {
        description:
          "Make ana@example.com an admin? Admins open every experiment, read every review and change anyone's role.",
        action: "Make admin",
      },
    );
    assert.deepEqual(
      roleChangeConfirmation("ben@example.com", "user", "developer", false),
      {
        description:
          "Make ben@example.com a developer? Developers open every experiment and read every review, but can't change roles or delete an experiment's data.",
        action: "Make developer",
      },
    );
    assert.deepEqual(
      roleChangeConfirmation("ben@example.com", "developer", "user", false),
      {
        description:
          "Remove ben@example.com's developer role? They'll lose access to experiments and Admin.",
        action: "Remove role",
      },
    );
    assert.deepEqual(
      roleChangeConfirmation("ana@example.com", "admin", "user", true),
      {
        description:
          "Remove ana@example.com's admin role? They'll lose access to experiments and Admin. You'll lose access to People.",
        action: "Remove role",
      },
    );
    assert.match(
      roleChangeConfirmation("ana@example.com", "admin", "developer", true)
        .description,
      / You'll lose access to People\.$/,
    );
  });

  test("the line under the heading is R11's", () => {
    assert.equal(
      PEOPLE_WORDS.timing,
      "Changes take effect the next time they open a page.",
    );
  });

  test("the filter matches part of an email, and announces its count", () => {
    const rows = peopleRows(
      [
        person(ANA, "ana@example.com", "admin"),
        person(BEN, "ben@example.com"),
        person(CAL, "cal@other.test"),
      ],
      ANA,
    );
    assert.deepEqual(
      filterPeople(rows, " EXAMPLE ").map((r) => r.email),
      ["ana@example.com", "ben@example.com"],
    );
    assert.deepEqual(filterPeople(rows, "nobody"), []);
    assert.equal(matchAnnouncement(3), "3 people match.");
    assert.equal(matchAnnouncement(1), "1 person matches.");
  });

  test("every people state key is team-only and has its view", () => {
    for (const key of PEOPLE_STATE_KEYS) {
      assert.equal(SANDBOX_STATE_KEYS[key], "team", key);
      assert.equal(readSandboxState(key, "reviewer"), null);
      assert.ok(peopleStateView(key), key);
    }
    assert.equal(peopleStateView(null), null);
    assert.equal(peopleStateView("people-empty")!.rows!.length, 1);
    assert.equal(peopleStateView("people-error")!.error, true);
    assert.ok(
      peopleStateView("people-partial")!.rows!.some(
        (r) => r.lastSignIn === null,
      ),
    );
    assert.equal(
      peopleStateView("people-last-admin")!.rows!.find((r) => r.isYou)!.locked,
      true,
    );
    // "(you)" in every fixture is the synthetic viewer, never a real account.
    for (const key of PEOPLE_STATE_KEYS)
      for (const row of peopleStateView(key)!.rows ?? [])
        if (row.isYou) assert.equal(row.id, PEOPLE_FIXTURE_VIEWER.id, key);
    const fixtures = JSON.stringify(peopleStateView("people-success"));
    assert.doesNotMatch(fixtures, /@(?!example\.com)/);
  });
});
