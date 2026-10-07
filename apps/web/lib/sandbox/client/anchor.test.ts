/**
 * LAB-12 C1 and C6: anchors built from a click, from Enter on a marked
 * region's Tab stop and from Enter on a design control, and resolved only
 * inside the shown design's root. Plain fakes stand in for the DOM.
 */

import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { pinInput } from "../validators.ts";
import {
  ANCHOR_BYTES_MAX,
  buildAnchor,
  keyboardPoint,
  pinOffset,
  resolveAnchor,
  type AnchorElement,
} from "./anchor.ts";
import { PLACE_FALLBACK, placeName } from "./place-name.ts";

type Box = { left: number; top: number; width: number; height: number };

type Fake = AnchorElement & { children: Fake[]; parentElement: Fake | null };

function el(
  tag: string,
  options: {
    attrs?: Record<string, string>;
    id?: string;
    text?: string;
    box?: Box;
  } = {},
  children: Fake[] = [],
): Fake {
  const node: Fake = {
    tagName: tag.toUpperCase(),
    id: options.id ?? "",
    parentElement: null,
    children,
    get textContent() {
      return options.text ?? children.map((c) => c.textContent ?? "").join(" ");
    },
    getAttribute: (name) => options.attrs?.[name] ?? null,
    getBoundingClientRect: () =>
      options.box ?? { left: 0, top: 0, width: 0, height: 0 },
  };
  for (const child of children) child.parentElement = node;
  return node;
}

/** One design: a marked Plans section with a button and a paragraph, and an unmarked footer. */
function design(name: string, origin = 0) {
  const choose = el("button", {
    text: "Choose annual billing for the whole team today",
    box: { left: origin + 100, top: 300, width: 200, height: 40 },
  });
  const para = el("p", {
    text: "Who each plan is for",
    box: { left: origin + 20, top: 250, width: 400, height: 20 },
  });
  const plans = el(
    "section",
    {
      attrs: { "data-sandbox-region": "plans", "data-sandbox-name": "Plans" },
      box: { left: origin, top: 200, width: 800, height: 400 },
    },
    [para, choose],
  );
  const hero = el("div", {
    id: "hero",
    text: name,
    box: { left: origin, top: 0, width: 800, height: 200 },
  });
  const note = el("span", {
    text: "Prices exclude tax",
    box: { left: origin + 10, top: 700, width: 100, height: 10 },
  });
  const footer = el("footer", {}, [el("div", {}, [note])]);
  const root = el(
    "div",
    {
      attrs: { "data-sandbox-design": name },
      box: { left: origin, top: 0, width: 800, height: 800 },
    },
    [hero, plans, footer],
  );
  return { root, plans, para, choose, hero, note, footer };
}

describe("C1: a click, or Enter on a Tab stop, gives the composer a place name and an anchor", () => {
  test("a click on a marked region anchors to its marked id, fractions of its box", () => {
    const d = design("circle");
    const anchor = buildAnchor(d.root, d.plans, { x: 200, y: 300 }, "Plans");
    assert.deepEqual(anchor, {
      marked: "plans",
      x: 0.25,
      y: 0.25,
      place: "Plans",
    });
    assert.equal(placeName(d.root, d.plans), "Plans");
  });

  test("a click on an element with an id anchors to the id; with neither, to its path", () => {
    const d = design("circle");
    assert.deepEqual(buildAnchor(d.root, d.hero, { x: 400, y: 50 }), {
      id: "hero",
      x: 0.5,
      y: 0.25,
    });
    const byPath = buildAnchor(d.root, d.para, { x: 220, y: 260 });
    assert.deepEqual(byPath, {
      path: "section:nth-of-type(1)>p:nth-of-type(1)",
      x: 0.5,
      y: 0.5,
    });
    assert.equal(resolveAnchor(d.root, byPath!), d.para);
  });

  test("every fraction lies in 0 to 1, even for a point outside the box", () => {
    const d = design("circle");
    const anchor = buildAnchor(d.root, d.plans, { x: -50, y: 9999 })!;
    assert.equal(anchor.x, 0);
    assert.equal(anchor.y, 1);
  });

  test("Enter on a marked region's Tab stop anchors at its top-start corner", () => {
    const d = design("circle");
    const point = keyboardPoint(d.plans, "region");
    assert.deepEqual(buildAnchor(d.root, d.plans, point), {
      marked: "plans",
      x: 0,
      y: 0,
    });
  });

  test("Enter on a design control anchors at its centre, and names its place by the nearest marked region", () => {
    const d = design("circle");
    const anchor = buildAnchor(
      d.root,
      d.choose,
      keyboardPoint(d.choose, "control"),
    )!;
    assert.equal(anchor.x, 0.5);
    assert.equal(anchor.y, 0.5);
    assert.equal(placeName(d.root, d.choose), "Plans");
  });

  test("outside every region the place is the element's text, at most 40 characters in quotes, else the fallback", () => {
    const d = design("circle");
    assert.equal(placeName(d.root, d.note), '"Prices exclude tax"');
    const long = el("a", {
      text: "Choose annual billing for the whole team today, and save",
    });
    const root = el("div", {}, [long]);
    const name = placeName(root, long);
    assert.ok(name.startsWith('"Choose annual billing'));
    assert.equal(name.length, 42);
    assert.equal(placeName(d.root, el("div")), PLACE_FALLBACK);
  });

  test("a target outside the shown design's root gives no anchor", () => {
    const circle = design("circle");
    const square = design("square");
    assert.equal(buildAnchor(circle.root, square.plans, { x: 1, y: 1 }), null);
  });

  test("a path past 2 KB falls back to the nearest marked region", () => {
    let deep = el("span", {
      box: { left: 10, top: 210, width: 10, height: 10 },
    });
    const leaf = deep;
    for (let i = 0; i < 120; i++) deep = el("div", {}, [deep]);
    const region = el(
      "section",
      {
        attrs: { "data-sandbox-region": "faq" },
        box: { left: 0, top: 200, width: 100, height: 100 },
      },
      [deep],
    );
    const root = el("div", {}, [region]);
    const anchor = buildAnchor(root, leaf, { x: 15, y: 215 })!;
    assert.equal(anchor.marked, "faq");
    assert.ok(JSON.stringify(anchor).length <= ANCHOR_BYTES_MAX);
  });
});

describe("C6: each pin resolves inside its own design's root only", () => {
  test("two designs sharing a marked id each resolve their own pin, in their own box", () => {
    const circle = design("circle", 0);
    const square = design("square", 1000);
    const anchor = { marked: "plans", x: 0.5, y: 0.5 } as const;
    assert.equal(resolveAnchor(circle.root, anchor), circle.plans);
    assert.equal(resolveAnchor(square.root, anchor), square.plans);
    // Offsets are from each root's own corner.
    assert.deepEqual(pinOffset(circle.root, anchor), { left: 400, top: 400 });
    assert.deepEqual(pinOffset(square.root, anchor), { left: 400, top: 400 });
    // An id shared by both designs resolves the same way.
    assert.equal(
      resolveAnchor(square.root, { id: "hero", x: 0, y: 0 }),
      square.hero,
    );
  });

  test("a pin whose anchor is missing is not drawn", () => {
    const d = design("circle");
    for (const anchor of [
      { marked: "pricing-table", x: 0.5, y: 0.5 },
      { id: "gone", x: 0.5, y: 0.5 },
      { path: "section:nth-of-type(4)>p:nth-of-type(1)", x: 0, y: 0 },
      { path: "not a path", x: 0, y: 0 },
    ] as const) {
      assert.equal(resolveAnchor(d.root, anchor), null);
      assert.equal(pinOffset(d.root, anchor), null);
    }
  });
});

describe("C1: every anchor built here is one the server accepts", () => {
  function send(anchor: unknown) {
    return pinInput.safeParse({
      id: "0b7b0c1e-0000-4000-8000-000000000001",
      number: 1,
      design: "circle",
      kind: null,
      body: "A comment",
      anchor,
      viewportW: 390,
      viewportH: 844,
      clientCreatedAt: "2026-10-07T10:00:00.000Z",
    }).success;
  }

  test("a deep path past 1,024 characters falls back to its region; a long region name is cut to 80", () => {
    let deep = el("span", {
      box: { left: 10, top: 210, width: 10, height: 10 },
    });
    const leaf = deep;
    for (let i = 0; i < 60; i++) deep = el("div", {}, [deep]);
    const region = el(
      "section",
      {
        attrs: {
          "data-sandbox-region": "faq",
          "data-sandbox-name":
            "Questions people ask before they choose a plan for a team of more than fifty editors",
        },
        box: { left: 0, top: 200, width: 100, height: 100 },
      },
      [deep],
    );
    const root = el("div", {}, [region]);
    const anchor = buildAnchor(
      root,
      leaf,
      { x: 15, y: 215 },
      placeName(root, leaf),
    )!;
    assert.equal(anchor.marked, "faq");
    assert.ok(anchor.place!.length <= 80);
    assert.ok(send(anchor));
  });

  test("an id past 1,024 characters falls back to the path, and the root anchors as a last resort", () => {
    const long = el("div", { id: "x".repeat(1100) });
    const root = el("div", {}, [long]);
    const anchor = buildAnchor(root, long, { x: 0, y: 0 })!;
    assert.equal(anchor.path, "div:nth-of-type(1)");
    assert.ok(send(anchor));
    let deep = el("span");
    const leaf = deep;
    for (let i = 0; i < 60; i++) deep = el("div", {}, [deep]);
    const bare = el("div", {}, [deep]);
    const last = buildAnchor(bare, leaf, { x: 0, y: 0 })!;
    assert.equal(last.path, "");
    assert.ok(send(last));
  });

  test("the demo design's anchors all pass", () => {
    const d = design("circle");
    for (const target of [d.plans, d.hero, d.para, d.choose, d.note, d.footer])
      assert.ok(
        send(
          buildAnchor(
            d.root,
            target,
            { x: 1, y: 1 },
            placeName(d.root, target),
          ),
        ),
      );
  });
});
