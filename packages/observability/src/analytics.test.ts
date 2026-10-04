/** The analytics stub accepts a typed event and sends nothing. */

import assert from "node:assert/strict";
import { test } from "node:test";

import { track } from "./analytics.ts";

test("track is a no-op until a vendor is wired", () => {
  assert.equal(track("page_viewed", { path: "/" }), undefined);
});
