/** C1: the picker per tier, and the fallback to the unsuffixed value. Every value is synthetic. */

import assert from "node:assert/strict";
import { test } from "node:test";

import { pickedName, pickTiered, tieredNames, tierName } from "./pick.ts";
import { parseTier, TIERS } from "./tier.ts";

const all = {
  EXAMPLE_API_URL_LOCAL: "http://localhost:4010",
  EXAMPLE_API_URL_STAGING: "https://staging.api.example.test",
  EXAMPLE_API_URL: "https://api.example.test",
};

test("C1: each tier reads its own variable", () => {
  assert.equal(
    pickTiered(all, "EXAMPLE_API_URL", "local"),
    all.EXAMPLE_API_URL_LOCAL,
  );
  assert.equal(
    pickTiered(all, "EXAMPLE_API_URL", "staging"),
    all.EXAMPLE_API_URL_STAGING,
  );
  assert.equal(
    pickTiered(all, "EXAMPLE_API_URL", "production"),
    all.EXAMPLE_API_URL,
  );
});

test("C1: a tier whose own value is absent or empty reads the unsuffixed value", () => {
  const onlyProduction = { EXAMPLE_API_URL: "https://api.example.test" };
  for (const tier of TIERS)
    assert.equal(
      pickTiered(onlyProduction, "EXAMPLE_API_URL", tier),
      "https://api.example.test",
    );
  const emptyLocal = { ...onlyProduction, EXAMPLE_API_URL_LOCAL: "  " };
  assert.equal(
    pickTiered(emptyLocal, "EXAMPLE_API_URL", "local"),
    "https://api.example.test",
  );
  assert.equal(
    pickedName(emptyLocal, "EXAMPLE_API_URL", "local"),
    "EXAMPLE_API_URL",
  );
});

test("C1: nothing set picks undefined", () => {
  for (const tier of TIERS) {
    assert.equal(pickTiered({}, "EXAMPLE_API_URL", tier), undefined);
    assert.equal(pickedName({}, "EXAMPLE_API_URL", tier), undefined);
  }
});

test("C1: production never reads a suffixed value", () => {
  const noProduction = {
    EXAMPLE_API_URL_LOCAL: "http://localhost:4010",
    EXAMPLE_API_URL_STAGING: "https://staging.api.example.test",
  };
  assert.equal(
    pickTiered(noProduction, "EXAMPLE_API_URL", "production"),
    undefined,
  );
});

test("C1: the suffix grammar names each form", () => {
  assert.equal(tierName("EXAMPLE_API_URL", "local"), "EXAMPLE_API_URL_LOCAL");
  assert.equal(
    tierName("EXAMPLE_API_URL", "staging"),
    "EXAMPLE_API_URL_STAGING",
  );
  assert.equal(tierName("EXAMPLE_API_URL", "production"), "EXAMPLE_API_URL");
  assert.deepEqual(tieredNames("EXAMPLE_API_URL"), [
    "EXAMPLE_API_URL",
    "EXAMPLE_API_URL_LOCAL",
    "EXAMPLE_API_URL_STAGING",
  ]);
});

test("C1: the switch defaults to local, never production, and names itself when wrong", () => {
  assert.equal(parseTier(undefined), "local");
  assert.equal(parseTier(""), "local");
  assert.equal(parseTier(" staging "), "staging");
  assert.equal(parseTier("production"), "production");
  assert.throws(() => parseTier("prod"), /DATABASE_ENVIRONMENT is "prod"/);
});
