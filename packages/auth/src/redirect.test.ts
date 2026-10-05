/** The callback's redirect rules: the site's own origin, and `next` only as a path on it. */

import assert from "node:assert/strict";
import { test } from "node:test";

import { afterSignInUrl, callbackUrl, safeNextPath } from "./redirect.ts";

const LOCAL = "http://localhost:3000";

test("a sign-in on localhost lands back on localhost, at next", () => {
  assert.equal(
    afterSignInUrl(LOCAL, "/records?sort=name").toString(),
    "http://localhost:3000/records?sort=name",
  );
  assert.equal(afterSignInUrl(LOCAL, null).toString(), `${LOCAL}/`);
});

test("next that leaves the origin becomes /", () => {
  for (const next of [
    "https://evil.example.test/",
    "//evil.example.test/",
    "/\\evil.example.test/",
    "/\\/evil.example.test",
    "javascript:alert(1)",
    "records",
    "/\u0000//evil.example.test",
    "/\t/evil.example.test",
  ]) {
    assert.equal(safeNextPath(next), "/", next);
    assert.equal(afterSignInUrl(LOCAL, next).origin, LOCAL, next);
  }
});

test("the callback URL is on the site's origin and carries next only when it is a path", () => {
  assert.equal(
    callbackUrl(LOCAL, "/auth/callback", "/records"),
    "http://localhost:3000/auth/callback?next=%2Frecords",
  );
  assert.equal(
    callbackUrl(LOCAL, "/auth/callback", "//evil.example.test"),
    "http://localhost:3000/auth/callback",
  );
});
