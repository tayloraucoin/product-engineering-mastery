/** C2: a key whose mode does not match the tier fails, naming the variable. Every key is synthetic. */

import assert from "node:assert/strict";
import { test } from "node:test";

import { keyModeProblem } from "./key-mode.ts";

const LIVE = "sk_live_00000000000000000000synthetic";
const TEST = "sk_test_00000000000000000000synthetic";
const PUBLISHABLE_LIVE = "pk_live_00000000000000000000synthetic";

test("C2: a live-mode key on local or staging fails with the variable named", () => {
  for (const tier of ["local", "staging"] as const) {
    const problem = keyModeProblem("STRIPE_SECRET_KEY_STAGING", LIVE, tier);
    assert.match(
      problem ?? "",
      /^STRIPE_SECRET_KEY_STAGING is a live-mode key/,
    );
    assert.match(problem ?? "", new RegExp(`is ${tier}`));
  }
  assert.match(
    keyModeProblem(
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LOCAL",
      PUBLISHABLE_LIVE,
      "local",
    ) ?? "",
    /^NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LOCAL is a live-mode key/,
  );
});

test("C2: a test-mode key on production fails with the variable named", () => {
  assert.match(
    keyModeProblem("STRIPE_SECRET_KEY", TEST, "production") ?? "",
    /^STRIPE_SECRET_KEY is a test-mode key, and DATABASE_ENVIRONMENT is production/,
  );
});

test("C2: matching modes pass", () => {
  assert.equal(keyModeProblem("STRIPE_SECRET_KEY", LIVE, "production"), null);
  assert.equal(keyModeProblem("STRIPE_SECRET_KEY_LOCAL", TEST, "local"), null);
  assert.equal(
    keyModeProblem("STRIPE_SECRET_KEY_STAGING", TEST, "staging"),
    null,
  );
});

test("C2: a key with no mode prefix fails on every tier", () => {
  for (const tier of ["local", "staging", "production"] as const)
    assert.match(
      keyModeProblem("STRIPE_SECRET_KEY", "not-a-key", tier) ?? "",
      /^STRIPE_SECRET_KEY has no live or test prefix/,
    );
});
