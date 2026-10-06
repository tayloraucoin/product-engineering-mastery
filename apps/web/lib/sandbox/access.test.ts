import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { describe, test } from "node:test";

import type { ExperimentConfig } from "../../app/experimental/_experiments/registry.ts";
import {
  grantAccessWith,
  resolveViewerWith,
  type GrantAccessDeps,
  type ResolveViewerDeps,
} from "./access-check.ts";
import { hashCode } from "./code.ts";
import { signAccessCookie } from "./cookie.ts";
import type { TeamMember } from "./team-check.ts";

const SECRET = "synthetic-sandbox-secret-for-tests-only-0123456789";
const NOW = new Date("2026-10-06T09:00:00Z");
const ACCESS_ID = "00000000-0000-4000-8000-0000000000a1";
const REVIEWER_ID = "00000000-0000-4000-8000-0000000000b1";
const USER_ID = "00000000-0000-4000-8000-0000000000c1";

const experiment = (slug: string, closedOn: string | null) =>
  ({ slug, closedOn }) as unknown as ExperimentConfig;
const EXPERIMENTS: Record<string, ExperimentConfig> = {
  "pricing-2026": experiment("pricing-2026", null),
  "onboarding-2026": experiment("onboarding-2026", null),
  "closed-2026": experiment("closed-2026", "2026-09-30"),
};
const findExperiment = (slug: string) => EXPERIMENTS[slug] ?? null;

const cookieFor = (slug: string, issuedAt = NOW) =>
  signAccessCookie(SECRET, { accessId: ACCESS_ID, slug, issuedAt });

const NO_DATABASE = () => {
  throw new Error("the database was reached");
};

/** Deps for a guest with `cookie`; checkAccess throws unless given. */
function guest(
  cookie: string | undefined,
  overrides: Partial<ResolveViewerDeps> = {},
): ResolveViewerDeps {
  return {
    getTeamMember: async () => null,
    findExperiment,
    readAccessCookie: () => cookie,
    secret: SECRET,
    now: NOW,
    getUserId: async () => null,
    checkAccess: NO_DATABASE,
    ...overrides,
  };
}

/** A seeded generator (mulberry32); the seed is printed on failure, and replays by fixing `SEED`. */
const SEED = randomBytes(4).readUInt32LE(0);
const seedNote = `(seed ${SEED})`;
let state = SEED >>> 0;
function nextRandom(): number {
  state = (state + 0x6d2b79f5) >>> 0;
  let t = state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const randomInt = (n: number) => Math.floor(nextRandom() * n);
const PRINTABLE =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-=+/";
function randomValue(): string {
  const length = randomInt(220);
  let out = "";
  for (let i = 0; i < length; i++)
    out += PRINTABLE[randomInt(PRINTABLE.length)];
  return out;
}
function tamper(value: string): string {
  const at = randomInt(value.length);
  let replacement = value[at]!;
  while (replacement === value[at])
    replacement = PRINTABLE[randomInt(PRINTABLE.length)]!;
  return value.slice(0, at) + replacement + value.slice(at + 1);
}

describe("C4: no database call before the cookie verifies", () => {
  test(`C4: random cookie values give the gate and never reach the database ${seedNote}`, async () => {
    for (let run = 0; run < 300; run++) {
      const value = randomValue();
      assert.deepEqual(
        await resolveViewerWith(guest(value), "pricing-2026"),
        { kind: "gate" },
        `${JSON.stringify(value)} ${seedNote}`,
      );
    }
  });

  test(`C4: tampered cookies give the gate and never reach the database ${seedNote}`, async () => {
    const valid = cookieFor("pricing-2026");
    for (let run = 0; run < 300; run++) {
      const value = tamper(valid);
      assert.deepEqual(
        await resolveViewerWith(guest(value), "pricing-2026"),
        { kind: "gate" },
        `${JSON.stringify(value)} ${seedNote}`,
      );
    }
  });

  test("C4: a valid cookie for another slug gives the gate with no database call", async () => {
    assert.deepEqual(
      await resolveViewerWith(
        guest(cookieFor("onboarding-2026")),
        "pricing-2026",
      ),
      { kind: "gate" },
    );
  });

  test("C4: an unknown slug with a valid cookie for it gives the gate with no database call", async () => {
    for (const slug of ["no-such-review", "pricing-2025"])
      assert.deepEqual(await resolveViewerWith(guest(cookieFor(slug)), slug), {
        kind: "gate",
      });
  });

  test("C4: a missing cookie, an expired one, or no secret gives the gate with no database call", async () => {
    const expired = cookieFor(
      "pricing-2026",
      new Date(NOW.getTime() - 30 * 24 * 60 * 60 * 1000),
    );
    for (const deps of [
      guest(undefined),
      guest(expired),
      guest(cookieFor("pricing-2026"), { secret: undefined }),
      guest(cookieFor("pricing-2026"), { secret: "" }),
    ])
      assert.deepEqual(await resolveViewerWith(deps, "pricing-2026"), {
        kind: "gate",
      });
  });

  test("C4: grantAccess on an unknown slug or a malformed code never reaches the database", async () => {
    const deps: GrantAccessDeps = {
      findExperiment,
      findLiveReviewerByCodeHash: NO_DATABASE,
      createAccess: NO_DATABASE,
    };
    const identity = { email: "ana@example.com" };
    for (const input of [
      { slug: "no-such-review", code: "7KQM-29XH-PATR-4WDN", identity },
      { slug: "pricing-2026", code: "7KQM-29XH-PATR-4WD", identity },
      { slug: "pricing-2026", code: "7KQM-29XH-PATR-4WDU", identity },
      { slug: "pricing-2026", code: "", identity },
    ])
      assert.equal(await grantAccessWith(deps, input), null);
  });
});

describe("C5: who resolveViewer says is asking", () => {
  const team = (role: TeamMember["role"]): TeamMember => ({
    userId: USER_ID,
    email: "team@example.com",
    role,
  });
  const NO_COOKIE_READ = () => {
    throw new Error("the cookie was read");
  };

  test("C5: a developer or admin is the team on a known slug, open or closed, without reading the cookie", async () => {
    for (const role of ["developer", "admin"] as const)
      for (const slug of ["pricing-2026", "closed-2026"]) {
        const result = await resolveViewerWith(
          guest(undefined, {
            getTeamMember: async () => team(role),
            readAccessCookie: NO_COOKIE_READ,
          }),
          slug,
        );
        assert.equal(result.kind, "team");
        assert.deepEqual(result.kind === "team" && result.viewer, {
          kind: "team",
          userId: USER_ID,
          email: "team@example.com",
          role,
        });
      }
  });

  test("C5: the team on an unknown slug is not found", async () => {
    assert.deepEqual(
      await resolveViewerWith(
        guest(undefined, {
          getTeamMember: async () => team("admin"),
          readAccessCookie: NO_COOKIE_READ,
        }),
        "no-such-review",
      ),
      { kind: "not-found" },
    );
  });

  test("C5: no access when checkAccess returns null", async () => {
    const calls: unknown[] = [];
    const result = await resolveViewerWith(
      guest(cookieFor("pricing-2026"), {
        checkAccess: async (input) => {
          calls.push(input);
          return null;
        },
      }),
      "pricing-2026",
    );
    assert.deepEqual(result, { kind: "gate" });
    assert.deepEqual(calls, [
      { accessId: ACCESS_ID, slug: "pricing-2026", userId: null },
    ]);
  });

  test("C5: a live access on a closed experiment is ended", async () => {
    const result = await resolveViewerWith(
      guest(cookieFor("closed-2026"), {
        checkAccess: async () => ({
          reviewerId: REVIEWER_ID,
          accessId: ACCESS_ID,
        }),
      }),
      "closed-2026",
    );
    assert.equal(result.kind, "ended");
    assert.deepEqual(result.kind === "ended" && result.viewer, {
      kind: "reviewer",
      slug: "closed-2026",
      reviewerId: REVIEWER_ID,
      accessId: ACCESS_ID,
    });
  });

  test("C5: a live access on an open experiment is a reviewer, and a signed-in reviewer's user id is passed", async () => {
    const calls: unknown[] = [];
    const result = await resolveViewerWith(
      guest(cookieFor("pricing-2026"), {
        getUserId: async () => USER_ID,
        checkAccess: async (input) => {
          calls.push(input);
          return { reviewerId: REVIEWER_ID, accessId: ACCESS_ID };
        },
      }),
      "pricing-2026",
    );
    assert.equal(result.kind, "reviewer");
    assert.deepEqual(result.kind === "reviewer" && result.viewer, {
      kind: "reviewer",
      slug: "pricing-2026",
      reviewerId: REVIEWER_ID,
      accessId: ACCESS_ID,
    });
    assert.deepEqual(calls, [
      { accessId: ACCESS_ID, slug: "pricing-2026", userId: USER_ID },
    ]);
  });

  test("C5: grantAccess looks the code up by its hash and records the email trimmed and lower-cased, or the user id", async () => {
    const lookups: { slug: string; codeHash: Uint8Array }[] = [];
    const created: unknown[] = [];
    const deps: GrantAccessDeps = {
      findExperiment,
      findLiveReviewerByCodeHash: async (input) => {
        lookups.push(input);
        return { reviewerId: REVIEWER_ID, codeVersion: 3 };
      },
      createAccess: async (input) => {
        created.push(input);
        return { accessId: ACCESS_ID };
      },
    };
    assert.deepEqual(
      await grantAccessWith(deps, {
        slug: "closed-2026",
        code: " 7kqm 29xh paTR-4wdn\n",
        identity: { email: "  Ana@Example.COM " },
      }),
      { accessId: ACCESS_ID },
    );
    assert.deepEqual(
      await grantAccessWith(deps, {
        slug: "pricing-2026",
        code: "7KQM-29XH-PATR-4WDN",
        identity: { userId: USER_ID },
      }),
      { accessId: ACCESS_ID },
    );
    assert.deepEqual(
      Buffer.from(lookups[0]!.codeHash),
      Buffer.from(hashCode("7KQM29XHPATR4WDN")),
    );
    assert.deepEqual(created, [
      { reviewerId: REVIEWER_ID, codeVersion: 3, email: "ana@example.com" },
      { reviewerId: REVIEWER_ID, codeVersion: 3, userId: USER_ID },
    ]);
  });

  test("C5: grantAccess is null when no live reviewer holds the code, or the access cannot be written", async () => {
    const identity = { email: "ana@example.com" };
    const input = { slug: "pricing-2026", code: "7KQM29XHPATR4WDN", identity };
    assert.equal(
      await grantAccessWith(
        {
          findExperiment,
          findLiveReviewerByCodeHash: async () => null,
          createAccess: NO_DATABASE,
        },
        input,
      ),
      null,
    );
    assert.equal(
      await grantAccessWith(
        {
          findExperiment,
          findLiveReviewerByCodeHash: async () => ({
            reviewerId: REVIEWER_ID,
            codeVersion: 1,
          }),
          createAccess: async () => null,
        },
        input,
      ),
      null,
    );
  });
});
