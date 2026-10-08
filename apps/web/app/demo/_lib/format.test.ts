import assert from "node:assert/strict";
import { test } from "node:test";

import { DEMO_TODAY, relativeDay } from "./clock.ts";
import { formatDate, formatUsd, versionCountWords } from "./format.ts";

test("C5: money and dates use the fixed locales", () => {
  assert.equal(formatUsd(52000), "52,000 USD");
  assert.equal(formatDate("2026-10-05"), "5 Oct 2026");
  assert.equal(formatDate("2026-09-01"), "1 Sep 2026");
});

test("C5: relative words read from DEMO_TODAY", () => {
  assert.equal(DEMO_TODAY, "2026-10-08");
  assert.equal(relativeDay("2026-10-05"), "3 days ago");
  assert.equal(relativeDay("2026-10-08"), "Today");
  assert.equal(relativeDay("2026-10-07"), "Yesterday");
  assert.equal(relativeDay("2026-10-20"), "in 12 days");
  assert.equal(relativeDay("2026-08-12"), "1 month ago");
});

test("C5: version-count words", () => {
  assert.equal(versionCountWords(4), "all 4 versions");
  assert.equal(versionCountWords(1), "its only version");
  assert.equal(versionCountWords(0), "no versions yet");
});
