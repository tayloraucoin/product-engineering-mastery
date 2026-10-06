import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, test } from "node:test";

import { grantAccessWith } from "./access-check.ts";
import { SANDBOX_MAC_LABELS, sandboxMac } from "./secret.ts";
import {
  GATE_THROTTLE,
  gateCookieOptions,
  networkKeyOf,
  newBrowserId,
  readBrowserId,
  throttleKeys,
  withGateThrottle,
  type GateThrottleStore,
} from "./throttle.ts";

const SECRET = "synthetic-sandbox-secret-for-tests-only-0123456789";
const NOW = new Date("2026-10-06T09:00:00Z");
const MINUTE = 60 * 1000;

describe("C1: the network key", () => {
  test("C1: an IPv4 address is its key, whole", () => {
    assert.equal(networkKeyOf("203.0.113.7", true), "203.0.113.7");
    assert.notEqual(
      networkKeyOf("203.0.113.7", true),
      networkKeyOf("203.0.113.8", true),
    );
  });

  test("C1: compressed and expanded spellings of one /64 give one key; another /64 another", () => {
    const spellings = [
      "2001:db8:1:2::1",
      "2001:0db8:0001:0002:0000:0000:0000:0001",
      "2001:DB8:1:2:ffff:ffff:ffff:ffff",
      "2001:db8:1:2::",
      "2001:db8:1:2:a:b:c:d",
      "2001:db8:1:2:a:b:192.0.2.1",
    ];
    const keys = new Set(spellings.map((s) => networkKeyOf(s, true)));
    assert.deepEqual([...keys], ["2001:db8:1:2::/64"]);
    assert.equal(networkKeyOf("2001:db8:1:3::1", true), "2001:db8:1:3::/64");
    assert.equal(networkKeyOf("2001:db8::1", true), "2001:db8:0:0::/64");
  });

  test("C1: an IPv4-mapped IPv6 address is its IPv4", () => {
    assert.equal(networkKeyOf("::ffff:203.0.113.7", true), "203.0.113.7");
    assert.equal(networkKeyOf("::FFFF:cb00:7107", true), "203.0.113.7");
    assert.equal(
      networkKeyOf("0:0:0:0:0:ffff:203.0.113.7", true),
      "203.0.113.7",
    );
  });

  test("C1: the first hop is used when the header holds several", () => {
    assert.equal(
      networkKeyOf("203.0.113.7, 198.51.100.2", true),
      "203.0.113.7",
    );
    assert.equal(
      networkKeyOf(" 2001:db8:1:2::9 , 203.0.113.7", true),
      "2001:db8:1:2::/64",
    );
  });

  test("C1: not deployed, or a missing or malformed header, gives no network key", () => {
    assert.equal(networkKeyOf("203.0.113.7", false), null);
    for (const value of [
      undefined,
      null,
      "",
      " ",
      "unknown",
      "203.0.113",
      "203.0.113.7:443",
      "[2001:db8::1]",
      "2001:db8::1::2",
      "999.0.0.1",
      ",203.0.113.7",
    ])
      assert.equal(networkKeyOf(value, true), null, JSON.stringify(value));
  });

  test("C1: keys are HMACs under label throttle, never the raw value or its plain SHA-256, and the two kinds never collide", () => {
    const browserId = newBrowserId();
    const keys = throttleKeys({
      secret: SECRET,
      browserId,
      networkKey: "203.0.113.7",
    });
    for (const key of [keys.browser!, keys.network!]) {
      assert.equal(key.length, 32);
      const hex = Buffer.from(key).toString("hex");
      for (const raw of [browserId, "203.0.113.7"]) {
        assert.ok(!Buffer.from(key).includes(Buffer.from(raw)));
        assert.notEqual(hex, createHash("sha256").update(raw).digest("hex"));
      }
    }
    const same = throttleKeys({
      secret: SECRET,
      browserId: "203.0.113.7",
      networkKey: "203.0.113.7",
    });
    assert.ok(!Buffer.from(same.browser!).equals(Buffer.from(same.network!)));
    assert.deepEqual(
      throttleKeys({ secret: SECRET, browserId: null, networkKey: null }),
      { browser: null, network: null },
    );
    assert.throws(() =>
      throttleKeys({ secret: undefined, browserId, networkKey: null }),
    );
    // The named derivation: HMAC under SANDBOX_SECRET, label throttle, over b:<id> or n:<address>.
    assert.equal(SANDBOX_MAC_LABELS.throttle, "throttle");
    assert.deepEqual(
      Buffer.from(keys.browser!),
      sandboxMac(SECRET, SANDBOX_MAC_LABELS.throttle, `b:${browserId}`),
    );
    assert.deepEqual(
      Buffer.from(keys.network!),
      sandboxMac(SECRET, SANDBOX_MAC_LABELS.throttle, "n:203.0.113.7"),
    );
  });

  test("C1: the browser id is 128 random bits; anything else in the cookie is no id", () => {
    const id = newBrowserId();
    assert.equal(Buffer.from(id, "base64url").length, 16);
    assert.equal(readBrowserId(id), id);
    for (const value of [
      undefined,
      "",
      "short",
      `${id}x`,
      "a".repeat(21) + "!",
    ])
      assert.equal(readBrowserId(value), null);
    assert.deepEqual(gateCookieOptions(true), {
      path: "/experimental",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      maxAge: 86400,
    });
    assert.equal(gateCookieOptions(false).secure, false);
  });

  test("C1: the thresholds are one constant: 5 per browser and 30 per network in 15 minutes, then a 15-minute lock", () => {
    assert.deepEqual(GATE_THROTTLE, {
      browser: { limit: 5, windowMs: 15 * MINUTE, lockMs: 15 * MINUTE },
      network: { limit: 30, windowMs: 15 * MINUTE, lockMs: 15 * MINUTE },
    });
  });
});

/** An in-memory store with the database functions' counting rules. */
function memoryStore() {
  const rows = new Map<
    string,
    { failures: number; windowEndsAt: number; lockedUntil: number | null }
  >();
  const calls: string[] = [];
  const hex = (key: Uint8Array) => Buffer.from(key).toString("hex");
  const store: GateThrottleStore = {
    async readGateLock({ keyHashes, now }) {
      calls.push("readGateLock");
      let latest: number | null = null;
      for (const key of keyHashes) {
        const row = rows.get(hex(key));
        if (row?.lockedUntil && row.lockedUntil > now.getTime())
          latest = Math.max(latest ?? 0, row.lockedUntil);
      }
      return { lockedUntil: latest === null ? null : new Date(latest) };
    },
    async recordGateFailure({ keyHash, limit, windowMs, lockMs, now }) {
      calls.push("recordGateFailure");
      const t = now.getTime();
      const row = rows.get(hex(keyHash));
      const fresh = !row || row.windowEndsAt <= t;
      const failures = fresh ? 1 : row.failures + 1;
      const next = {
        failures,
        windowEndsAt: fresh ? t + windowMs : row.windowEndsAt,
        lockedUntil:
          failures >= limit ? t + lockMs : (row?.lockedUntil ?? null),
      };
      rows.set(hex(keyHash), next);
      return {
        failures,
        lockedUntil:
          next.lockedUntil === null ? null : new Date(next.lockedUntil),
      };
    },
    async clearGateKey({ keyHash }) {
      calls.push("clearGateKey");
      return { cleared: rows.delete(hex(keyHash)) ? 1 : 0 };
    },
  };
  return { store, rows, calls, hex };
}

const LIVE_CODE = "7KQM-29XH-PATR-4WDN";
const REVIEWER_ID = "00000000-0000-4000-8000-0000000000b1";
const ACCESS_ID = "00000000-0000-4000-8000-0000000000a1";

/** LAB-5's grantAccess on a stub database: one live code on pricing-2026, and a record of lookups. */
function gate() {
  const lookups: string[] = [];
  const attempt = (slug: string, code: string) => () =>
    grantAccessWith(
      {
        findExperiment: (s) =>
          s === "pricing-2026" ? ({ slug: s, closedOn: null } as never) : null,
        findLiveReviewerByCodeHash: async (input) => {
          lookups.push(input.slug);
          return code === LIVE_CODE
            ? { reviewerId: REVIEWER_ID, codeVersion: 1 }
            : null;
        },
        createAccess: async () => ({ accessId: ACCESS_ID }),
      },
      { slug, code, identity: { email: "ana@example.com" } },
    );
  return { lookups, attempt };
}

const keysFor = (browserId: string, networkKey: string | null = null) =>
  throttleKeys({ secret: SECRET, browserId, networkKey });

describe("C2: locks, and every slug alike", () => {
  test("C2: during a lock the next try returns lockedUntil and the code lookup never runs, even with a correct code", async () => {
    const { store } = memoryStore();
    const { lookups, attempt } = gate();
    const keys = keysFor(newBrowserId());
    for (let i = 0; i < 4; i++)
      assert.deepEqual(
        await withGateThrottle(
          store,
          keys,
          NOW,
          attempt("pricing-2026", "WRONG"),
        ),
        { ok: false, lockedUntil: null },
      );
    const fifth = await withGateThrottle(
      store,
      keys,
      NOW,
      attempt("pricing-2026", "WRONG"),
    );
    assert.deepEqual(fifth, {
      ok: false,
      lockedUntil: new Date(NOW.getTime() + 15 * MINUTE),
    });
    lookups.length = 0;
    const locked = await withGateThrottle(
      store,
      keys,
      new Date(NOW.getTime() + MINUTE),
      attempt("pricing-2026", LIVE_CODE),
    );
    assert.deepEqual(locked, {
      ok: false,
      lockedUntil: new Date(NOW.getTime() + 15 * MINUTE),
    });
    assert.deepEqual(lookups, []);
    assert.ok(locked.lockedUntil instanceof Date);
  });

  test("C2: a wrong try on an unknown slug and on a real slug give the same result and count against the same keys", async () => {
    const real = memoryStore();
    const unknown = memoryStore();
    const browserId = newBrowserId();
    const keys = keysFor(browserId, "203.0.113.7");
    const onReal = await withGateThrottle(
      real.store,
      keys,
      NOW,
      gate().attempt("pricing-2026", "WRONG"),
    );
    const onUnknown = await withGateThrottle(
      unknown.store,
      keys,
      NOW,
      gate().attempt("no-such-review", "WRONG"),
    );
    assert.deepEqual(onUnknown, onReal);
    assert.deepEqual([...unknown.rows.entries()], [...real.rows.entries()]);
    assert.deepEqual(unknown.calls, real.calls);
    assert.equal(real.rows.size, 2);
  });

  test("C2: a well-formed code never issued gives the same result and rows on a real and an unknown slug; only the real slug is looked up", async () => {
    const NEVER_ISSUED = "ZZZZ-ZZZZ-ZZZZ-ZZZZ";
    const real = memoryStore();
    const unknown = memoryStore();
    const keys = keysFor(newBrowserId(), "203.0.113.7");
    const onReal = gate();
    const onUnknown = gate();
    const realResult = await withGateThrottle(
      real.store,
      keys,
      NOW,
      onReal.attempt("pricing-2026", NEVER_ISSUED),
    );
    const unknownResult = await withGateThrottle(
      unknown.store,
      keys,
      NOW,
      onUnknown.attempt("no-such-review", NEVER_ISSUED),
    );
    assert.deepEqual(unknownResult, realResult);
    assert.deepEqual(realResult, { ok: false, lockedUntil: null });
    assert.deepEqual([...unknown.rows.entries()], [...real.rows.entries()]);
    assert.deepEqual(unknown.calls, real.calls);
    assert.deepEqual(onReal.lookups, ["pricing-2026"]);
    assert.deepEqual(onUnknown.lookups, []);
  });

  test("C2: a lock reached on one slug blocks every slug", async () => {
    const { store } = memoryStore();
    const keys = keysFor(newBrowserId());
    const slugs = ["no-such-review", "pricing-2026", "other", "x", "y"];
    for (const slug of slugs)
      await withGateThrottle(store, keys, NOW, gate().attempt(slug, "WRONG"));
    for (const slug of ["pricing-2026", "no-such-review", "onboarding-2026"]) {
      const { lookups, attempt } = gate();
      const result = await withGateThrottle(
        store,
        keys,
        NOW,
        attempt(slug, LIVE_CODE),
      );
      assert.equal(result.ok, false, slug);
      assert.ok(!result.ok && result.lockedUntil, slug);
      assert.deepEqual(lookups, []);
    }
  });

  test("C2: a locked network key refuses a fresh browser", async () => {
    const { store } = memoryStore();
    for (let i = 0; i < 30; i++)
      await withGateThrottle(
        store,
        keysFor(newBrowserId(), "203.0.113.7"),
        NOW,
        gate().attempt("pricing-2026", "WRONG"),
      );
    const { lookups, attempt } = gate();
    const result = await withGateThrottle(
      store,
      keysFor(newBrowserId(), "203.0.113.7"),
      NOW,
      attempt("pricing-2026", LIVE_CODE),
    );
    assert.equal(result.ok, false);
    assert.deepEqual(lookups, []);
  });

  test("C2: a success clears the browser key only, and returns the attempt's value", async () => {
    const { store, rows, hex } = memoryStore();
    const keys = keysFor(newBrowserId(), "203.0.113.7");
    await withGateThrottle(
      store,
      keys,
      NOW,
      gate().attempt("pricing-2026", "WRONG"),
    );
    const result = await withGateThrottle(
      store,
      keys,
      NOW,
      gate().attempt("pricing-2026", LIVE_CODE),
    );
    assert.deepEqual(result, { ok: true, value: { accessId: ACCESS_ID } });
    assert.equal(rows.has(hex(keys.browser!)), false);
    assert.equal(rows.get(hex(keys.network!))?.failures, 1);
  });
});
