import assert from "node:assert/strict";
import { test } from "node:test";

import { demoEntryPath } from "./entry.ts";
import { parseDemoPrefs, serializeDemoPrefs } from "./prefs.ts";

const onboarded = serializeDemoPrefs({
  v: 1,
  onboarded: true,
  compactRows: false,
  defaultSort: "vendor-asc",
});

test("C1: a missing, invalid or not-onboarded cookie goes to onboarding", () => {
  assert.equal(demoEntryPath(parseDemoPrefs(undefined)), "/demo/welcome");
  assert.equal(demoEntryPath(parseDemoPrefs("")), "/demo/welcome");
  assert.equal(demoEntryPath(parseDemoPrefs("%7Bnot-json")), "/demo/welcome");
  assert.equal(
    demoEntryPath(parseDemoPrefs(encodeURIComponent('{"v":2,"onboarded":true}'))),
    "/demo/welcome",
  );
  assert.equal(
    demoEntryPath(
      parseDemoPrefs(
        serializeDemoPrefs({
          v: 1,
          onboarded: false,
          compactRows: false,
          defaultSort: "vendor-asc",
        }),
      ),
    ),
    "/demo/welcome",
  );
});

test("C1: an onboarded cookie goes to the records", () => {
  assert.equal(demoEntryPath(parseDemoPrefs(onboarded)), "/demo/records");
});
