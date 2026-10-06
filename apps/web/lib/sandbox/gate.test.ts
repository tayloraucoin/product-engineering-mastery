import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

import type { ExperimentConfig } from "../../app/experimental/_experiments/registry.ts";
import {
  grantAccessWith,
  resolveViewerWith,
  type ResolveViewerDeps,
  type ViewerResult,
} from "./access-check.ts";
import { signAccessCookie } from "./cookie.ts";
import {
  enterGateWith,
  GATE_FIXTURE,
  GATE_STATE_KEYS,
  GATE_WORDS,
  gateFormView,
  gatePath,
  gateView,
  isGateStateKey,
  slugOfGatePath,
  type EnterGateDeps,
  type GateProps,
} from "./gate.ts";
import { readSandboxState, SANDBOX_STATE_KEYS } from "./state.ts";
import {
  throttleKeys,
  withGateThrottle,
  type GateThrottleStore,
} from "./throttle.ts";

const SECRET = "synthetic-sandbox-secret-for-tests-only-0123456789";
const NOW = new Date("2026-10-06T09:00:00Z");
const ACCESS_ID = "00000000-0000-4000-8000-0000000000a1";
const REVIEWER_ID = "00000000-0000-4000-8000-0000000000b1";
const USER_ID = "00000000-0000-4000-8000-0000000000c1";
const LIVE_CODE = "7KQM-29XH-PATR-4WDN";

const EXPERIMENTS: Record<string, ExperimentConfig> = {
  "pricing-2026": { slug: "pricing-2026", closedOn: null } as never,
  "closed-2026": { slug: "closed-2026", closedOn: "2026-09-30" } as never,
};
const findExperiment = (slug: string) => EXPERIMENTS[slug] ?? null;
const NO_DATABASE = () => {
  throw new Error("the database was reached");
};

function resolveAs(
  slug: string,
  overrides: Partial<ResolveViewerDeps> = {},
): Promise<ViewerResult> {
  return resolveViewerWith(
    {
      getTeamMember: async () => null,
      findExperiment,
      readAccessCookies: () => [],
      secret: SECRET,
      now: NOW,
      getUserId: async () => null,
      checkAccess: NO_DATABASE,
      ...overrides,
    },
    slug,
  );
}

const blank = (path: string): GateProps => ({
  path,
  prefilledEmail: null,
  accountEmail: null,
  state: null,
});

describe("C1: one face without access", () => {
  test("C1: a real slug, an unknown slug, a revoked code's cookie and a closed experiment give the Gate, status 200, props equal apart from the path", async () => {
    const revokedCookie = signAccessCookie(SECRET, {
      accessId: ACCESS_ID,
      slug: "pricing-2026",
      issuedAt: NOW,
    });
    const cases = [
      ["pricing-2026", await resolveAs("pricing-2026")],
      ["no-such-review", await resolveAs("no-such-review")],
      [
        "pricing-2026",
        await resolveAs("pricing-2026", {
          readAccessCookies: () => [revokedCookie],
          checkAccess: async () => null,
        }),
      ],
      ["closed-2026", await resolveAs("closed-2026")],
    ] as const;
    const views = cases.map(([slug, result]) =>
      gateView(result, blank(gatePath(slug))),
    );
    for (const view of views) {
      assert.equal(view.kind, "gate");
      assert.equal(view.kind === "gate" && view.status, 200);
    }
    const withoutPath = views.map((view) => {
      assert.equal(view.kind, "gate");
      return view.kind === "gate" ? { ...view.props, path: "" } : null;
    });
    for (const props of withoutPath) assert.deepEqual(props, withoutPath[0]);
    assert.deepEqual(
      Object.keys(views[0]!.kind === "gate" ? views[0]!.props : {}).sort(),
      ["accountEmail", "path", "prefilledEmail", "state"],
    );
  });

  test("C1: the team on an unknown slug gets not-found", async () => {
    const result = await resolveAs("no-such-review", {
      getTeamMember: async () => ({
        userId: USER_ID,
        email: "team@example.com",
        role: "admin",
      }),
    });
    assert.deepEqual(gateView(result, blank(gatePath("no-such-review"))), {
      kind: "not-found",
    });
  });

  test("C1: the path round-trips to its slug, and the title is fixed for every slug", () => {
    for (const slug of ["pricing-2026", "no-such-review", "a b/c"])
      assert.equal(slugOfGatePath(gatePath(slug)), slug);
    assert.equal(gatePath("pricing-2026"), "/experimental/pricing-2026");
    const page = readFileSync(
      new URL("../../app/experimental/[slug]/page.tsx", import.meta.url),
      "utf8",
    );
    assert.match(
      page,
      /export const metadata: Metadata = \{ title: GATE_WORDS\.title \};/,
    );
    assert.doesNotMatch(page, /generateMetadata/);
    assert.equal(GATE_WORDS.title, "Design review");
  });
});

/** An in-memory throttle store that counts failures per key. */
function memoryStore() {
  const failures = new Map<string, number>();
  const hex = (key: Uint8Array) => Buffer.from(key).toString("hex");
  let tries = 0;
  const store: GateThrottleStore = {
    readGateLock: async () => ({ lockedUntil: null }),
    recordGateFailure: async ({ keyHash }) => {
      const n = (failures.get(hex(keyHash)) ?? 0) + 1;
      failures.set(hex(keyHash), n);
      return { failures: n, lockedUntil: null };
    },
    clearGateKey: async ({ keyHash }) => ({
      cleared: failures.delete(hex(keyHash)) ? 1 : 0,
    }),
  };
  return {
    store,
    failures,
    get tries() {
      return tries;
    },
    countTry() {
      tries += 1;
    },
  };
}

/** The action's dependencies, on stubs: one live code on each known slug. */
function deps(options: {
  live?: boolean;
  store?: ReturnType<typeof memoryStore>;
  throws?: boolean;
}) {
  const store = options.store ?? memoryStore();
  const keys = throttleKeys({
    secret: SECRET,
    browserId: "AAAAAAAAAAAAAAAAAAAAAA",
    networkKey: null,
  });
  const calls = {
    throttle: 0,
    lookups: 0,
    created: [] as unknown[],
    cookies: [] as string[],
    marked: 0,
  };
  const value: EnterGateDeps = {
    runThrottled: (attempt) => {
      calls.throttle += 1;
      return withGateThrottle(store.store, keys, NOW, attempt);
    },
    grantAccess: (input) =>
      grantAccessWith(
        {
          findExperiment,
          findLiveReviewerByCodeHash: async () => {
            calls.lookups += 1;
            if (options.throws) throw new Error("the store is down");
            return options.live
              ? { reviewerId: REVIEWER_ID, codeVersion: 1 }
              : null;
          },
          createAccess: async (input) => {
            calls.created.push(input);
            return { accessId: ACCESS_ID };
          },
        },
        input,
      ),
    setAccessCookie: async (accessId) => {
      calls.cookies.push(accessId);
    },
    markFailedTry: async () => {
      calls.marked += 1;
    },
  };
  return { deps: value, calls, store };
}

const guest = (slug: string, email: unknown, code: unknown) => ({
  slug,
  email,
  code,
  account: null,
});

describe("C2: one error for every code that does not open a review", () => {
  test("C2: a wrong code, a revoked code, an unknown slug and a non-live code on a closed experiment give the same error on the code field, one try each", async () => {
    const store = memoryStore();
    const results = [];
    for (const slug of [
      "pricing-2026",
      "pricing-2026",
      "no-such-review",
      "closed-2026",
    ]) {
      const { deps: d } = deps({ live: false, store });
      results.push(
        await enterGateWith(d, guest(slug, "ana@example.com", LIVE_CODE)),
      );
    }
    for (const result of results)
      assert.deepEqual(result, {
        kind: "error",
        errors: { code: GATE_WORDS.errors.wrongCode },
      });
    assert.deepEqual([...store.failures.values()], [4]);
  });

  test("C2: a code that does not normalise is a wrong code and counts as a try", async () => {
    const { deps: d, calls, store } = deps({ live: true });
    assert.deepEqual(
      await enterGateWith(d, guest("pricing-2026", "ana@example.com", "123")),
      { kind: "error", errors: { code: GATE_WORDS.errors.wrongCode } },
    );
    assert.equal(calls.throttle, 1);
    assert.equal(calls.lookups, 0);
    assert.deepEqual([...store.failures.values()], [1]);
  });

  test("C2: empty email, malformed email and empty code give their own words and reach neither the throttle nor the database", async () => {
    const cases: [unknown, unknown, Record<string, string>][] = [
      ["", LIVE_CODE, { email: GATE_WORDS.errors.emailEmpty }],
      ["   ", LIVE_CODE, { email: GATE_WORDS.errors.emailEmpty }],
      [null, LIVE_CODE, { email: GATE_WORDS.errors.emailEmpty }],
      ["ana@", LIVE_CODE, { email: GATE_WORDS.errors.emailMalformed }],
      [
        "ana example.com",
        LIVE_CODE,
        { email: GATE_WORDS.errors.emailMalformed },
      ],
      ["ana@example.com", "", { code: GATE_WORDS.errors.codeEmpty }],
      ["ana@example.com", " \n", { code: GATE_WORDS.errors.codeEmpty }],
      [
        "",
        "",
        {
          email: GATE_WORDS.errors.emailEmpty,
          code: GATE_WORDS.errors.codeEmpty,
        },
      ],
    ];
    for (const [email, code, errors] of cases) {
      const { deps: d, calls } = deps({ live: true });
      assert.deepEqual(
        await enterGateWith(d, guest("pricing-2026", email, code)),
        { kind: "error", errors },
        JSON.stringify([email, code]),
      );
      assert.equal(calls.throttle, 0);
      assert.equal(calls.lookups, 0);
      assert.equal(calls.marked, 0);
    }
  });

  test("C2: a store that throws gives server-error, holding neither field", async () => {
    const { deps: d } = deps({ live: true, throws: true });
    const result = await enterGateWith(
      d,
      guest("pricing-2026", "ana@example.com", LIVE_CODE),
    );
    assert.deepEqual(result, { kind: "server-error" });
    const text = JSON.stringify(result);
    assert.ok(!text.includes("ana@example.com") && !text.includes("7KQM"));
  });

  test("C2: the action keys the network counter only where the platform sets the address, and marks cookies Secure on any production runtime", () => {
    const action = readFileSync(
      new URL("../../app/experimental/[slug]/actions.ts", import.meta.url),
      "utf8",
    );
    assert.match(
      action,
      /networkKeyOf\(\s*\(await headers\(\)\)\.get\("x-forwarded-for"\),\s*deployed,\s*\)/,
    );
    assert.match(action, /gateCookieOptions\(productionRuntime\)/);
    // The action logs two fixed events and nothing a reviewer typed.
    assert.doesNotMatch(action, /console\./);
    assert.deepEqual(
      [...action.matchAll(/log\.\w+\(\s*"([^"]+)"/g)].map((m) => m[1]),
      ["sandbox.gate_failed", "auth.sign_out_unrevoked"],
    );
    assert.doesNotMatch(action, /log\.\w+\([^)]*(formData|email|input)/);
  });

  test("C2: no result ever carries the code or the email", async () => {
    for (const live of [true, false]) {
      const { deps: d } = deps({ live });
      const text = JSON.stringify(
        await enterGateWith(
          d,
          guest("pricing-2026", "ana@example.com", LIVE_CODE),
        ),
      );
      assert.ok(!text.includes("ana@") && !text.includes("7KQM"));
    }
  });
});

describe("C3: a live code lands on the page", () => {
  test("C3: a live code with a valid email sets the cookie and redirects to the path without ?r=, the email trimmed and lower-cased", async () => {
    const { deps: d, calls } = deps({ live: true });
    assert.deepEqual(
      await enterGateWith(
        d,
        guest("pricing-2026", "  Ana@Example.COM ", " 7kqm 29xh patr 4wdn "),
      ),
      { kind: "redirect", to: "/experimental/pricing-2026" },
    );
    assert.deepEqual(calls.cookies, [ACCESS_ID]);
    assert.deepEqual(calls.created, [
      { reviewerId: REVIEWER_ID, codeVersion: 1, email: "ana@example.com" },
    ]);
    assert.equal(calls.marked, 0);
  });

  test("C3: a live code on a closed experiment is granted the same way", async () => {
    const { deps: d, calls } = deps({ live: true });
    assert.deepEqual(
      await enterGateWith(
        d,
        guest("closed-2026", "ana@example.com", LIVE_CODE),
      ),
      { kind: "redirect", to: "/experimental/closed-2026" },
    );
    assert.deepEqual(calls.cookies, [ACCESS_ID]);
  });

  test("C3: a lock returns throttled with its instant, and the code is never looked up", async () => {
    const { deps: d, calls } = deps({ live: true });
    const lockedUntil = new Date("2026-10-06T09:15:00Z");
    const locked: EnterGateDeps = {
      ...d,
      runThrottled: (attempt) =>
        withGateThrottle(
          {
            readGateLock: async () => ({ lockedUntil }),
            recordGateFailure: NO_DATABASE,
            clearGateKey: NO_DATABASE,
          },
          { browser: null, network: null },
          NOW,
          attempt,
        ),
    };
    assert.deepEqual(
      await enterGateWith(
        locked,
        guest("pricing-2026", "ana@example.com", LIVE_CODE),
      ),
      { kind: "throttled", lockedUntil },
    );
    assert.equal(calls.lookups, 0);
  });
});

describe("C4: the signed-in face", () => {
  test("C4: a signed-in user without a role gets the account line, no email field, and a ?r= prefill is ignored", async () => {
    const view = gateView(await resolveAs("pricing-2026"), {
      path: gatePath("pricing-2026"),
      prefilledEmail: "linked@example.com",
      accountEmail: "ana@example.com",
      state: null,
    });
    assert.deepEqual(view, {
      kind: "gate",
      status: 200,
      props: {
        path: "/experimental/pricing-2026",
        prefilledEmail: null,
        accountEmail: "ana@example.com",
        state: null,
      },
    });
    assert.equal(
      gateFormView(view.kind === "gate" ? view.props : blank("")).email,
      "",
    );
  });

  test("C4: a live code enters with their user id, never an email, and the email field is not read", async () => {
    const { deps: d, calls } = deps({ live: true });
    assert.deepEqual(
      await enterGateWith(d, {
        slug: "pricing-2026",
        email: "not an email",
        code: LIVE_CODE,
        account: { userId: USER_ID },
      }),
      { kind: "redirect", to: "/experimental/pricing-2026" },
    );
    assert.deepEqual(calls.created, [
      { reviewerId: REVIEWER_ID, codeVersion: 1, userId: USER_ID },
    ]);
  });

  test("C4: the signed-in notice names the account email and keeps the other three points", () => {
    assert.match(GATE_WORDS.noticeSignedInFirst, /^Your account email, /);
    assert.equal(
      GATE_WORDS.noticeSignedInFirst.replace(
        "Your account email",
        "Your email",
      ),
      GATE_WORDS.notice[0],
    );
  });
});

describe("C5: the team never sees the gate", () => {
  test("C5: a developer or admin gets the experiment on a known slug, open or closed", async () => {
    for (const role of ["developer", "admin"] as const)
      for (const slug of ["pricing-2026", "closed-2026"])
        assert.deepEqual(
          gateView(
            await resolveAs(slug, {
              getTeamMember: async () => ({
                userId: USER_ID,
                email: "team@example.com",
                role,
              }),
            }),
            blank(gatePath(slug)),
          ),
          { kind: "experiment" },
        );
  });

  test("C5: a live reviewer gets the experiment, or ended on a closed one", async () => {
    const cookie = (slug: string) =>
      signAccessCookie(SECRET, { accessId: ACCESS_ID, slug, issuedAt: NOW });
    const live = async () => ({ reviewerId: REVIEWER_ID, accessId: ACCESS_ID });
    assert.deepEqual(
      gateView(
        await resolveAs("pricing-2026", {
          readAccessCookies: () => [cookie("pricing-2026")],
          checkAccess: live,
        }),
        blank(gatePath("pricing-2026")),
      ),
      { kind: "experiment" },
    );
    assert.deepEqual(
      gateView(
        await resolveAs("closed-2026", {
          readAccessCookies: () => [cookie("closed-2026")],
          checkAccess: live,
        }),
        blank(gatePath("closed-2026")),
      ),
      { kind: "ended" },
    );
  });
});

describe("C6: the gate's ?state= keys", () => {
  test("C6: every gate.md state is registered for anyone, and nothing else is a gate key", () => {
    const wanted = [
      "gate-empty",
      "gate-loading",
      "gate-error",
      "gate-partial",
      "gate-offline",
      "gate-success",
      "gate-throttled",
      "gate-revoked",
      "gate-signed-in",
      "gate-server-error",
    ];
    assert.deepEqual([...GATE_STATE_KEYS], wanted);
    for (const key of wanted) assert.equal(SANDBOX_STATE_KEYS[key], "anyone");
    for (const [key, audience] of Object.entries(SANDBOX_STATE_KEYS))
      if (!key.startsWith("gate-")) assert.equal(audience, "team", key);
  });

  test("C6: each gate key renders its fixture for anyone, on a real and an unknown slug alike", async () => {
    const results = {
      real: await resolveAs("pricing-2026"),
      unknown: await resolveAs("no-such-review"),
      team: await resolveAs("no-such-review", {
        getTeamMember: async () => ({
          userId: USER_ID,
          email: "team@example.com",
          role: "developer",
        }),
      }),
    };
    for (const key of GATE_STATE_KEYS) {
      for (const kind of ["guest", "reviewer", "team"] as const)
        assert.equal(readSandboxState(key, kind), key);
      const props = Object.values(results).map((result) => {
        const view = gateView(result, {
          ...blank("/experimental/x"),
          state: key,
        });
        assert.equal(view.kind, "gate", key);
        return view.kind === "gate" ? view.props : null;
      });
      for (const p of props) assert.deepEqual(p, props[0]);
    }
  });

  test("C6: the fixtures use synthetic values only, and each state shows what gate.md says", () => {
    const form = (state: (typeof GATE_STATE_KEYS)[number]) => {
      const view = gateView({ kind: "gate" }, { ...blank("/p"), state });
      return gateFormView(view.kind === "gate" ? view.props : blank("/p"));
    };
    assert.deepEqual(form("gate-empty"), form("gate-revoked"));
    assert.equal(form("gate-empty").email, "");
    assert.equal(form("gate-partial").email, GATE_FIXTURE.email);
    assert.equal(form("gate-loading").pending, true);
    assert.equal(form("gate-offline").offline, true);
    assert.equal(form("gate-success").success, true);
    assert.deepEqual(form("gate-error").result, {
      kind: "error",
      errors: { code: GATE_WORDS.errors.wrongCode },
    });
    assert.deepEqual(form("gate-throttled").result, {
      kind: "throttled",
      lockedUntil: GATE_FIXTURE.lockedUntil,
    });
    assert.equal(form("gate-throttled").email, GATE_FIXTURE.email);
    assert.deepEqual(form("gate-server-error").result, {
      kind: "server-error",
    });
    for (const key of GATE_STATE_KEYS) assert.equal(form(key).fixture, true);
    const signedIn = gateView(
      { kind: "gate" },
      {
        ...blank("/p"),
        state: "gate-signed-in",
      },
    );
    assert.equal(
      signedIn.kind === "gate" && signedIn.props.accountEmail,
      GATE_FIXTURE.email,
    );
    assert.match(GATE_FIXTURE.email, /@example\.com$/);
  });

  test("C6: a non-gate sandbox key renders only for the team, and for anyone else as if absent", () => {
    assert.equal(readSandboxState("shell-admin", "guest"), null);
    assert.equal(readSandboxState("shell-admin", "reviewer"), null);
    assert.equal(readSandboxState("shell-admin", "team"), "shell-admin");
    // The experiment page ignores a key that is not the gate's.
    assert.equal(isGateStateKey("shell-admin"), false);
    assert.equal(isGateStateKey(null), false);
  });
});

describe("C11: noindex metadata", () => {
  test("C11: the experimental layout exports robots metadata with index and follow false", () => {
    const layout = readFileSync(
      new URL("../../app/experimental/layout.tsx", import.meta.url),
      "utf8",
    );
    assert.match(
      layout,
      /export const metadata: Metadata = \{\s*robots: \{ index: false, follow: false \},\s*\};/,
    );
  });
});

describe("Words: gate.md verbatim", () => {
  test("Words: the notice's four points, the brand's contact address in the third", () => {
    assert.equal(GATE_WORDS.noticeHeading, "What we keep");
    assert.deepEqual(GATE_WORDS.notice, [
      "Your email, so the team knows whose feedback it is and can email you a confirmation when you send your review.",
      "Which designs you look at and for how long, your comments with the screen size you left them at, and your answers.",
      "We keep these until the team deletes them after the review. To have yours deleted, email hello@example.com.",
      "This browser remembers your access for 30 days.",
    ]);
  });

  test("Words: the throttled words name a time and never 'this browser'", () => {
    assert.equal(
      GATE_WORDS.throttled("14:32"),
      "Too many tries. You can try again after 14:32.",
    );
    assert.doesNotMatch(GATE_WORDS.throttled("14:32"), /browser/);
  });
});
