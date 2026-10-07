/**
 * Comment mode (pins.md, D-LAB-12), as a reducer that returns the next mode
 * and what to announce politely, pure. The bar's "Comment" toggle turns it
 * on and off; Escape leaves it; placing opens the composer; a save ends it.
 * There is no single-key shortcut (WCAG 2.1.4), so no event here is a key
 * other than Escape.
 */

import { PIN_WORDS } from "./pins-view.ts";

export type CommentMode = "off" | "on" | "composing";

export type CommentModeEvent =
  /** The bar's toggle. */
  | { type: "toggle" }
  /** Escape: closes the composer first, then leaves comment mode. */
  | { type: "escape" }
  /** A click, tap, or Enter or Space on a Tab stop. */
  | { type: "place" }
  | { type: "cancel" }
  | { type: "saved" }
  /** The review closed or access ended: placing is off. */
  | { type: "disable" };

export type CommentModeStep = {
  mode: CommentMode;
  /** The polite announcement, or null for none. */
  announcement: string | null;
};

const stay = (mode: CommentMode): CommentModeStep => ({
  mode,
  announcement: null,
});
const off: CommentModeStep = { mode: "off", announcement: PIN_WORDS.modeOff };

export function commentModeStep(
  mode: CommentMode,
  event: CommentModeEvent,
): CommentModeStep {
  switch (event.type) {
    case "toggle":
      return mode === "off"
        ? { mode: "on", announcement: PIN_WORDS.modeOn }
        : off;
    case "escape":
      if (mode === "composing") return stay("on");
      return mode === "on" ? off : stay("off");
    case "place":
      return mode === "off" ? stay("off") : stay("composing");
    case "cancel":
      return mode === "composing" ? stay("on") : stay(mode);
    case "saved":
      // The send result announces the save; the mode ends quietly with it.
      return stay("off");
    case "disable":
      return mode === "off" ? stay("off") : off;
  }
}
