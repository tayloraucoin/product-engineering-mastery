import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DEFAULT_DEMO_PREFS,
  parseDemoPrefs,
  serializeDemoPrefs,
} from "./prefs.ts";
import type { DemoPrefs } from "./record.ts";

test("C4: every valid DemoPrefs round-trips", () => {
  const sorts: DemoPrefs["defaultSort"][] = [
    "vendor-asc",
    "renews-asc",
    "value-desc",
  ];
  for (const onboarded of [true, false])
    for (const compactRows of [true, false])
      for (const defaultSort of sorts) {
        const prefs: DemoPrefs = { v: 1, onboarded, compactRows, defaultSort };
        assert.deepEqual(parseDemoPrefs(serializeDemoPrefs(prefs)), prefs);
      }
});

test("C4: anything invalid reads as the defaults", () => {
  const enc = (v: unknown) => encodeURIComponent(JSON.stringify(v));
  const ok = { onboarded: true, compactRows: true, defaultSort: "vendor-asc" };
  const bad = [
    undefined,
    null,
    "",
    "{not json",
    "%E0%A4%A",
    enc({ ...ok, v: 2 }),
    enc({ ...ok, v: 1, defaultSort: "sideways" }),
    enc({ ...ok, v: 1, onboarded: "yes" }),
    enc(null),
    enc([1]),
  ];
  for (const raw of bad)
    assert.deepEqual(parseDemoPrefs(raw), DEFAULT_DEMO_PREFS);
  assert.deepEqual(DEFAULT_DEMO_PREFS, {
    v: 1,
    onboarded: false,
    compactRows: false,
    defaultSort: "vendor-asc",
  });
});
