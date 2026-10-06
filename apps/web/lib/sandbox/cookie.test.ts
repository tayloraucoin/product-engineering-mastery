import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  ACCESS_COOKIE_MAX_AGE_SECONDS,
  accessCookieOptions,
  signAccessCookie,
  verifyAccessCookie,
} from "./cookie.ts";
import { encodeMac, SANDBOX_MAC_LABELS, sandboxMac } from "./secret.ts";

const SECRET = "synthetic-sandbox-secret-for-tests-only-0123456789";
const ACCESS_ID = "00000000-0000-4000-8000-0000000000a1";
const SLUG = "pricing-2026";
const ISSUED = new Date("2026-10-01T12:00:00Z");
const DAY = 24 * 60 * 60 * 1000;
const at = (ms: number) => new Date(ISSUED.getTime() + ms);

const cookie = signAccessCookie(SECRET, {
  accessId: ACCESS_ID,
  slug: SLUG,
  issuedAt: ISSUED,
});
const verify = (value: string, slug = SLUG, now = at(DAY)) =>
  verifyAccessCookie(SECRET, value, { slug, now });

/** A cookie with any payload, MAC'd under any label, as a forger with the secret could build it. */
function forge(payload: string, label: string = SANDBOX_MAC_LABELS.access) {
  return `${payload}.${encodeMac(sandboxMac(SECRET, label as never, payload))}`;
}

describe("C3: the access cookie", () => {
  test("C3: the value is v1.<accessId>.<slug>.<issuedAt seconds>.<mac>", () => {
    const parts = cookie.split(".");
    assert.equal(parts.length, 5);
    assert.deepEqual(parts.slice(0, 4), [
      "v1",
      ACCESS_ID,
      SLUG,
      String(ISSUED.getTime() / 1000),
    ]);
  });

  test("C3: a signed cookie verifies for its slug at any age under 30 days", () => {
    for (const age of [0, 1000, DAY, 29 * DAY, 30 * DAY - 1000])
      assert.deepEqual(verify(cookie, SLUG, at(age)), { accessId: ACCESS_ID });
  });

  test("C3: a one-character change anywhere fails", () => {
    for (let i = 0; i < cookie.length; i++) {
      for (const replacement of ["a", "0", "-", "_", "Z"]) {
        if (cookie[i] === replacement) continue;
        const changed = cookie.slice(0, i) + replacement + cookie.slice(i + 1);
        assert.equal(verify(changed), null, `position ${i} as ${replacement}`);
      }
    }
  });

  test("C3: a foreign slug fails, whichever slug it was signed for", () => {
    assert.equal(verify(cookie, "pricing-2027"), null);
    const other = signAccessCookie(SECRET, {
      accessId: ACCESS_ID,
      slug: "onboarding-2026",
      issuedAt: ISSUED,
    });
    assert.equal(verify(other, SLUG), null);
    assert.deepEqual(verify(other, "onboarding-2026"), {
      accessId: ACCESS_ID,
    });
  });

  test("C3: an age of 30 days or more fails", () => {
    for (const age of [30 * DAY, 30 * DAY + 1000, 365 * DAY])
      assert.equal(verify(cookie, SLUG, at(age)), null, `age ${age}`);
  });

  test("C3: an issuedAt in the future fails", () => {
    assert.equal(verify(cookie, SLUG, at(-1000)), null);
    const future = forge(
      `v1.${ACCESS_ID}.${SLUG}.${ISSUED.getTime() / 1000 + 3600}`,
    );
    assert.equal(verify(future, SLUG, ISSUED), null);
  });

  test("C3: a missing part fails", () => {
    const parts = cookie.split(".");
    for (let i = 0; i < parts.length; i++) {
      const missing = parts.filter((_, j) => j !== i).join(".");
      assert.equal(verify(missing), null, `without part ${i}`);
      const emptied = parts.map((p, j) => (j === i ? "" : p)).join(".");
      assert.equal(verify(emptied), null, `part ${i} empty`);
    }
    assert.equal(verify(""), null);
  });

  test("C3: another version fails, even with a valid MAC", () => {
    const seconds = ISSUED.getTime() / 1000;
    for (const version of ["v2", "v0", "V1", ""])
      assert.equal(
        verify(forge(`${version}.${ACCESS_ID}.${SLUG}.${seconds}`)),
        null,
        version,
      );
  });

  test("C3: a MAC under another label fails", () => {
    const payload = cookie.slice(0, cookie.lastIndexOf("."));
    assert.equal(verify(forge(payload, SANDBOX_MAC_LABELS.link)), null);
    assert.equal(verify(forge(payload, SANDBOX_MAC_LABELS.throttle)), null);
    assert.deepEqual(verify(forge(payload)), { accessId: ACCESS_ID });
  });

  test("C3: another secret, no secret or a short secret fails", () => {
    const now = { slug: SLUG, now: at(DAY) };
    assert.equal(verifyAccessCookie(`${SECRET}x`, cookie, now), null);
    assert.equal(verifyAccessCookie(undefined, cookie, now), null);
    assert.equal(verifyAccessCookie(null, cookie, now), null);
    assert.equal(verifyAccessCookie("", cookie, now), null);
    assert.equal(verifyAccessCookie("short-secret", cookie, now), null);
  });

  test("C3: a malformed access id or issue time fails, even with a valid MAC", () => {
    const seconds = ISSUED.getTime() / 1000;
    for (const payload of [
      `v1.not-a-uuid.${SLUG}.${seconds}`,
      `v1.${ACCESS_ID.toUpperCase()}.${SLUG}.${seconds}`,
      `v1.${ACCESS_ID}.${SLUG}.0${seconds}`,
      `v1.${ACCESS_ID}.${SLUG}.${seconds}.5`,
      `v1.${ACCESS_ID}.${SLUG}.-1`,
      `v1.${ACCESS_ID}.${SLUG}.1e9`,
    ])
      assert.equal(verify(forge(payload)), null, payload);
  });

  test("C3: a value too long to be a cookie fails before it is split", () => {
    assert.equal(verify(`${cookie}${".x".repeat(200)}`), null);
  });

  test("C3: the cookie is set on its slug's path, HttpOnly, Lax, 30 days, Secure only when deployed", () => {
    assert.deepEqual(accessCookieOptions(SLUG, true), {
      path: "/experimental/pricing-2026",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      maxAge: ACCESS_COOKIE_MAX_AGE_SECONDS,
    });
    assert.equal(accessCookieOptions(SLUG, false).secure, false);
    assert.equal(ACCESS_COOKIE_MAX_AGE_SECONDS, 2_592_000);
  });

  test("C3: signing refuses a short secret and malformed fields", () => {
    assert.throws(() =>
      signAccessCookie("short", {
        accessId: ACCESS_ID,
        slug: SLUG,
        issuedAt: ISSUED,
      }),
    );
    assert.throws(() =>
      signAccessCookie(SECRET, {
        accessId: "x",
        slug: SLUG,
        issuedAt: ISSUED,
      }),
    );
    assert.throws(() =>
      signAccessCookie(SECRET, {
        accessId: ACCESS_ID,
        slug: "Pricing.2026",
        issuedAt: ISSUED,
      }),
    );
  });
});
