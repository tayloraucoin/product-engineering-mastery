/** Where the code runs fixes the site URL (D-STK-3). Every URL is synthetic. */

import assert from "node:assert/strict";
import { test } from "node:test";

import { isDeployed, resolveSiteUrl } from "./site-url.ts";

const LOCAL = "http://localhost:3000";

test("outside a deployment the site URL is localhost, whatever is configured", () => {
  for (const platform of [undefined, "", "development"]) {
    assert.equal(isDeployed(platform), false);
    assert.equal(
      resolveSiteUrl({
        deployed: isDeployed(platform),
        configured: "https://www.example.test",
        localOrigin: LOCAL,
      }),
      LOCAL,
    );
  }
});

test("in a deployment the configured URL is used, without a trailing slash", () => {
  for (const platform of ["production", "preview"]) {
    assert.equal(isDeployed(platform), true);
    assert.equal(
      resolveSiteUrl({
        deployed: true,
        configured: "https://www.example.test/",
        localOrigin: LOCAL,
      }),
      "https://www.example.test",
    );
  }
  assert.equal(
    resolveSiteUrl({
      deployed: true,
      configured: undefined,
      localOrigin: LOCAL,
    }),
    undefined,
  );
});
