/**
 * LAB-12 C5 and C9's view: after a switch only the shown design's pins are
 * drawn while the count across designs holds; closed or revoked shows its
 * line and gives Edit, Delete and Retry their reason. Also the pins' names,
 * the merge on load, numbering and the `?state=` fixtures.
 */

import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { EXPERIMENT_WORDS } from "./experiment-view.ts";
import {
  heldReason,
  isPinsStateKey,
  mergeLoaded,
  nextPinNumber,
  pinName,
  PINS_STATE_KEYS,
  pinsBar,
  pinsFixture,
  pinsOnDesign,
  pinTime,
  type Pin,
} from "./pins-view.ts";
import type { QueueEntry } from "./queue.ts";

function entry(number: number, design: string, body = "A comment"): QueueEntry {
  return {
    id: `0b7b0c1e-0000-4000-8000-00000000000${number}`,
    number,
    design,
    kind: null,
    body,
    anchor: { marked: "plans", x: 0.5, y: 0.5, place: "Plans" },
    viewportW: 390,
    viewportH: 844,
    clientCreatedAt: "2026-10-07T10:00:00.000Z",
  };
}

const sent = (e: QueueEntry): Pin => ({ ...e, sync: "sent" });

describe("C5: after a switch only the shown design's pins are drawn; the count is unchanged", () => {
  test("switching from Circle to Square draws Square's pins only, and the bar's count holds", () => {
    const pins = [
      entry(1, "circle"),
      entry(2, "square"),
      entry(3, "circle"),
    ].map(sent);
    const state = {
      pins,
      load: "ok" as const,
      held: null,
      online: true,
      saved: false,
    };
    assert.deepEqual(
      pinsOnDesign(pins, "circle").map((p) => p.number),
      [1, 3],
    );
    assert.deepEqual(
      pinsOnDesign(pins, "square").map((p) => p.number),
      [2],
    );
    assert.equal(pinsBar(state).commentCount, 3);
    assert.equal(pinsBar({ ...state }).commentCount, 3);
  });
});

describe("C9: closed or revoked shows its line and gives each disabled control its reason", () => {
  test("the bar shows exp-closed or exp-revoked's line, above every other status", () => {
    const pins = [entry(1, "circle")].map((e) => ({
      ...e,
      sync: "unsent" as const,
    }));
    for (const held of ["closed", "revoked"] as const) {
      const bar = pinsBar({
        pins,
        load: "ok",
        held,
        online: false,
        saved: true,
      });
      assert.deepEqual(bar.status, { kind: held });
      assert.equal(bar.commentCount, 1);
    }
    assert.equal(
      EXPERIMENT_WORDS.closed.startsWith("This review has closed"),
      true,
    );
  });

  test("the reasons are pins.md's, and none while open", () => {
    assert.equal(
      heldReason("closed"),
      "This review has closed, so comments can't be changed.",
    );
    assert.equal(
      heldReason("revoked"),
      "This page can't save comments any more.",
    );
    assert.equal(heldReason(null), null);
  });
});

describe("the bar's save status", () => {
  const base = { load: "ok" as const, held: null, online: true, saved: false };
  test("unsent pins are partial with their count; offline wins; a failed load is error; loading has no count", () => {
    const pins: Pin[] = [
      sent(entry(1, "circle")),
      { ...entry(2, "circle"), sync: "unsent" },
      { ...entry(3, "square"), sync: "unsent" },
    ];
    assert.deepEqual(pinsBar({ ...base, pins }).status, {
      kind: "partial",
      unsent: 2,
    });
    assert.deepEqual(pinsBar({ ...base, pins, online: false }).status, {
      kind: "offline",
    });
    assert.deepEqual(pinsBar({ ...base, pins: [], load: "error" }), {
      commentCount: null,
      status: { kind: "error" },
    });
    assert.equal(
      pinsBar({ ...base, pins: [], load: "loading" }).commentCount,
      null,
    );
    assert.deepEqual(
      pinsBar({ ...base, pins: [sent(entry(1, "circle"))], saved: true })
        .status,
      {
        kind: "saved",
      },
    );
  });
});

describe("names, numbers and the merge", () => {
  test("a pin's name carries its number, type, place and 'not sent'", () => {
    assert.equal(
      pinName({
        number: 3,
        kind: "problem",
        anchor: { marked: "x", x: 0, y: 0, place: "Pricing table" },
        sync: "sent",
      }),
      "Comment 3, Problem, on Pricing table",
    );
    assert.equal(
      pinName({
        number: 3,
        kind: null,
        anchor: { marked: "x", x: 0, y: 0, place: "Pricing table" },
        sync: "unsent",
      }),
      "Comment 3, on Pricing table, not sent",
    );
    assert.equal(
      pinName({
        number: 4,
        kind: "keep",
        anchor: { path: "", x: 0, y: 0 },
        sync: "sending",
      }),
      "Comment 4, Keep this, on this part of the page, not sent",
    );
  });

  test("the next number is one past the highest held, loaded or queued", () => {
    assert.equal(nextPinNumber([]), 1);
    assert.equal(
      nextPinNumber([{ number: 2 }, { number: 7 }, { number: 3 }]),
      8,
    );
  });

  test("a queued entry overrides the server's row with its id; a queue-only pin is unsent", () => {
    const merged = mergeLoaded(
      [
        {
          ...entry(1, "circle", "Old text"),
          createdAt: "2026-10-07T10:01:00.000Z",
        },
        entry(2, "square"),
      ],
      [entry(1, "circle", "Newer text"), entry(3, "circle")],
    );
    assert.deepEqual(
      merged.map((p) => [p.number, p.body, p.sync]),
      [
        [1, "Newer text", "unsent"],
        [2, "A comment", "sent"],
        [3, "A comment", "unsent"],
      ],
    );
    assert.equal(merged[0]!.createdAt, "2026-10-07T10:01:00.000Z");
  });

  test("the time is the locale's short form", () => {
    assert.match(pinTime("2026-10-05T13:32:00Z", "en-GB"), /^5 Oct, \d{2}:32$/);
    assert.equal(pinTime("nope"), "");
  });
});

describe("pins.md's nine ?state= keys", () => {
  test("each has a fixture on synthetic pins", () => {
    assert.equal(PINS_STATE_KEYS.length, 9);
    for (const key of PINS_STATE_KEYS) {
      assert.ok(isPinsStateKey(key));
      const fixture = pinsFixture(key);
      for (const pin of fixture.pins)
        assert.match(pin.id, /^00000000-0000-4000-8000-/);
    }
    assert.equal(pinsFixture("pins-empty").pins.length, 0);
    assert.equal(pinsFixture("comment-mode").mode, "on");
    assert.equal(pinsFixture("too-long").draft!.body.length, 2140);
    assert.equal(pinsFixture("pins-loading").draft!.saving, true);
    assert.equal(pinsFixture("pins-offline").online, false);
    assert.deepEqual(
      pinsBar({ ...pinsFixture("pins-partial"), load: "ok", held: null })
        .status,
      { kind: "partial", unsent: 2 },
    );
    assert.equal(isPinsStateKey("exp-empty"), false);
  });
});
