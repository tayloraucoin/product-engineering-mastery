/**
 * LAB-12 C2: comment mode's reducer. Escape turns it off and announces
 * "Comment mode off."; a save turns it off too. No other key acts.
 */

import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { commentModeStep, type CommentMode } from "./comment-mode.ts";

describe("C2: Escape and a save each end comment mode", () => {
  test("the toggle turns it on, with the announcement", () => {
    assert.deepEqual(commentModeStep("off", { type: "toggle" }), {
      mode: "on",
      announcement:
        "Comment mode on. Choose any part of the page, or press Escape to stop.",
    });
  });

  test("Escape in comment mode turns it off and announces 'Comment mode off.'", () => {
    assert.deepEqual(commentModeStep("on", { type: "escape" }), {
      mode: "off",
      announcement: "Comment mode off.",
    });
  });

  test("Escape with the composer open closes the composer first; a second Escape leaves the mode", () => {
    const first = commentModeStep("composing", { type: "escape" });
    assert.deepEqual(first, { mode: "on", announcement: null });
    assert.equal(commentModeStep(first.mode, { type: "escape" }).mode, "off");
  });

  test("a save turns it off", () => {
    assert.equal(commentModeStep("composing", { type: "saved" }).mode, "off");
  });

  test("the toggle while composing, and a closed review, turn it off with the announcement", () => {
    for (const mode of ["on", "composing"] as CommentMode[]) {
      assert.deepEqual(commentModeStep(mode, { type: "toggle" }), {
        mode: "off",
        announcement: "Comment mode off.",
      });
      assert.equal(commentModeStep(mode, { type: "disable" }).mode, "off");
    }
  });

  test("placing does nothing while comment mode is off, and Escape off says nothing", () => {
    assert.deepEqual(commentModeStep("off", { type: "place" }), {
      mode: "off",
      announcement: null,
    });
    assert.deepEqual(commentModeStep("off", { type: "escape" }), {
      mode: "off",
      announcement: null,
    });
    assert.equal(commentModeStep("on", { type: "place" }).mode, "composing");
    assert.equal(commentModeStep("composing", { type: "cancel" }).mode, "on");
  });
});
