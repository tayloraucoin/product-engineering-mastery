/** OKLCH to hex: the anchors of the sRGB gamut and the preset's neutral steps. */

import assert from "node:assert/strict";
import { test } from "node:test";

import { oklchToHex } from "./color.ts";

test("white, black and the sRGB primaries", () => {
  assert.equal(oklchToHex("oklch(1 0 0)"), "#ffffff");
  assert.equal(oklchToHex("oklch(0 0 0)"), "#000000");
  assert.equal(oklchToHex("oklch(0.628 0.2577 29.23)"), "#ff0000");
  assert.equal(oklchToHex("oklch(0.452 0.313 264.05)"), "#0000ff");
});

test("lightness as a percentage, and an alpha, are accepted", () => {
  assert.equal(oklchToHex("oklch(62.8% 0.2577 29.23)"), "#ff0000");
  assert.equal(oklchToHex("oklch(1 0 0 / 50%)"), "#ffffff");
});

test("the preset's neutral steps", () => {
  assert.equal(oklchToHex("oklch(0.205 0 0)"), "#171717");
  assert.equal(oklchToHex("oklch(0.985 0 0)"), "#fafafa");
  assert.equal(oklchToHex("oklch(0.922 0 0)"), "#e5e5e5");
});

test("anything but oklch() is refused", () => {
  assert.throws(() => oklchToHex("rgb(0 0 0)"), /Not an oklch\(\) colour/);
});
