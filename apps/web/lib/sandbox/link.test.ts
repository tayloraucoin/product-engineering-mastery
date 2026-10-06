import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { resolveViewerWith } from "./access-check.ts";
import { signAccessCookie } from "./cookie.ts";
import {
  linkUrlFor,
  readLinkEmailWith,
  signLinkToken,
  verifyLinkToken,
  type LinkEmailDeps,
} from "./link.ts";
import { encodeMac, SANDBOX_MAC_LABELS, sandboxMac } from "./secret.ts";

const SECRET = "synthetic-sandbox-secret-for-tests-only-0123456789";
const ACCESS_ID = "00000000-0000-4000-8000-0000000000a1";
const ERASED_ID = "00000000-0000-4000-8000-0000000000a2";
const SLUG = "pricing-2026";
const KNOWN = new Set([SLUG, "onboarding-2026"]);

/** The database as findAccessEmail sees it: one access, with its email, on one slug. */
function deps(calls: unknown[] = []): LinkEmailDeps {
  return {
    secret: SECRET,
    isKnownSlug: (slug) => KNOWN.has(slug),
    findAccessEmail: async (input) => {
      calls.push(input);
      return input.accessId === ACCESS_ID && input.slug === SLUG
        ? "ana@example.com"
        : null;
    },
  };
}

const token = signLinkToken(SECRET, ACCESS_ID);

describe("C6: the email link's token fills the email and nothing else", () => {
  test("C6: the token is <accessId>.<mac>, the MAC truncated to 128 bits", () => {
    const [id, mac] = token.split(".");
    assert.equal(id, ACCESS_ID);
    assert.equal(Buffer.from(mac!, "base64url").length, 16);
  });

  test("C6: a token fills its access's email on its own slug", async () => {
    const calls: unknown[] = [];
    assert.equal(
      await readLinkEmailWith(deps(calls), SLUG, token),
      "ana@example.com",
    );
    assert.deepEqual(calls, [{ accessId: ACCESS_ID, slug: SLUG }]);
  });

  test("C6: a tampered token gives null with no error and no database call", async () => {
    for (let i = 0; i < token.length; i++) {
      for (const replacement of ["a", "0", "-", "_", "."]) {
        if (token[i] === replacement) continue;
        const calls: unknown[] = [];
        const tampered = token.slice(0, i) + replacement + token.slice(i + 1);
        assert.equal(
          await readLinkEmailWith(deps(calls), SLUG, tampered),
          null,
          `position ${i}`,
        );
        assert.deepEqual(calls, []);
      }
    }
  });

  test("C6: a cookie's MAC, or a whole cookie, is not a token", async () => {
    const cookieMac = encodeMac(
      sandboxMac(SECRET, SANDBOX_MAC_LABELS.access, ACCESS_ID).subarray(0, 16),
    );
    const cookie = signAccessCookie(SECRET, {
      accessId: ACCESS_ID,
      slug: SLUG,
      issuedAt: new Date(),
    });
    for (const value of [`${ACCESS_ID}.${cookieMac}`, cookie]) {
      const calls: unknown[] = [];
      assert.equal(await readLinkEmailWith(deps(calls), SLUG, value), null);
      assert.deepEqual(calls, []);
    }
  });

  test("C6: a foreign-slug or erased access gives null with no error", async () => {
    assert.equal(
      await readLinkEmailWith(deps(), "onboarding-2026", token),
      null,
    );
    assert.equal(
      await readLinkEmailWith(deps(), SLUG, signLinkToken(SECRET, ERASED_ID)),
      null,
    );
  });

  test("C6: an unknown slug gives null without reaching the database", async () => {
    const calls: unknown[] = [];
    assert.equal(
      await readLinkEmailWith(deps(calls), "no-such-review", token),
      null,
    );
    assert.deepEqual(calls, []);
  });

  test("C6: no secret, no token, or a token that is not a string gives null", async () => {
    assert.equal(
      await readLinkEmailWith({ ...deps(), secret: undefined }, SLUG, token),
      null,
    );
    for (const value of [undefined, null, "", [token], 7])
      assert.equal(await readLinkEmailWith(deps(), SLUG, value), null);
    assert.equal(verifyLinkToken(`${SECRET}x`, token), null);
  });

  test("C6: a request carrying only ?r= still gets no access", async () => {
    const NO_DATABASE = () => {
      throw new Error("the database was reached");
    };
    for (const cookie of [undefined, token])
      assert.deepEqual(
        await resolveViewerWith(
          {
            getTeamMember: async () => null,
            findExperiment: (slug) =>
              KNOWN.has(slug) ? ({ slug, closedOn: null } as never) : null,
            readAccessCookie: () => cookie,
            secret: SECRET,
            now: new Date(),
            getUserId: async () => null,
            checkAccess: NO_DATABASE,
          },
          SLUG,
        ),
        { kind: "gate" },
      );
  });

  test("C6: the link's origin is the site URL it is given, with the token in ?r=", () => {
    const url = new URL(
      linkUrlFor("https://www.example.test", SECRET, SLUG, ACCESS_ID),
    );
    assert.equal(url.origin, "https://www.example.test");
    assert.equal(url.pathname, "/experimental/pricing-2026");
    assert.deepEqual([...url.searchParams.keys()], ["r"]);
    assert.equal(url.searchParams.get("r"), token);
  });
});
