import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

import { designOption, EXPERIMENT_WORDS } from "./experiment-view.ts";
import { clampScroll, planSwitch, switchAnnouncement } from "./switcher.ts";

const DESIGNS = [
  designOption({ id: "circle", shape: "circle" }),
  designOption({ id: "square", shape: "square" }),
];

describe("C4: a switch makes no request, keeps the scroll, logs once and announces", () => {
  test("C4: switching to Square logs one switch event and announces it with the comment count", () => {
    const plan = planSwitch({
      designs: DESIGNS,
      shown: "circle",
      to: "square",
      counted: true,
      commentsOn: 2,
    });
    assert.deepEqual(plan, {
      shown: "square",
      log: { kind: "switch", design: "square" },
      announcement: "Showing the Square design. 2 of your comments are on it.",
    });
  });

  test("C4: the plan makes no request: the module reaches no fetch, action or database", () => {
    const source = readFileSync(
      new URL("./switcher.ts", import.meta.url),
      "utf8",
    );
    for (const banned of [
      /\bfetch\(/,
      /from "[^"]*(@pem\/db|next\/headers|env|actions)[^"]*"/,
      /"use server"/,
    ])
      assert.doesNotMatch(source, banned);
  });

  test("C4: the shown design, or one outside the experiment, plans nothing and logs nothing", () => {
    for (const to of ["circle", "hexagon", undefined, 1])
      assert.equal(
        planSwitch({
          designs: DESIGNS,
          shown: "circle",
          to,
          counted: true,
          commentsOn: 0,
        }),
        null,
      );
  });

  test("C4: the team's switch is announced but not logged", () => {
    const plan = planSwitch({
      designs: DESIGNS,
      shown: "square",
      to: "circle",
      counted: false,
      commentsOn: null,
    });
    assert.equal(plan?.log, null);
    assert.equal(plan?.announcement, "Showing the Circle design.");
  });

  test("C4: the scroll is kept, clamped to the new page's length", () => {
    // Kept when the new page is long enough.
    assert.equal(clampScroll(1200, 4000, 800), 1200);
    // Clamped to the new page's end when it is shorter.
    assert.equal(clampScroll(3000, 2400, 800), 1600);
    // A page shorter than the viewport scrolls to the top.
    assert.equal(clampScroll(500, 600, 800), 0);
    assert.equal(clampScroll(-20, 4000, 800), 0);
  });

  test("C4: the announcement's counts [ASSUMPTION: singular and none]", () => {
    const square = DESIGNS[1]!;
    assert.equal(
      switchAnnouncement(square, 1),
      "Showing the Square design. 1 of your comments is on it.",
    );
    assert.equal(
      switchAnnouncement(square, 0),
      "Showing the Square design. None of your comments are on it.",
    );
  });
});

describe("C7 (unit): labels are glyph plus shape name", () => {
  test("every shape's label and accessible name", () => {
    assert.deepEqual(
      (["circle", "square", "triangle", "diamond"] as const).map((shape) => {
        const o = designOption({ id: shape, shape });
        return [o.label, o.accessibleName];
      }),
      [
        ["● Circle", "Circle design"],
        ["■ Square", "Square design"],
        ["▲ Triangle", "Triangle design"],
        ["◆ Diamond", "Diamond design"],
      ],
    );
    assert.equal(EXPERIMENT_WORDS.comments(5), "Comments 5");
  });
});
