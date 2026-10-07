/**
 * A pin's place name (pins.md "Place name"), pure: the "On: …" in the
 * composer, and the "on …" in the pin's name, the list and the triage.
 * The nearest marked region's name; else the element's own visible text, up
 * to 40 characters, in quotes; else "this part of the page". The name is
 * stored in the anchor, so the list and the review read it without the
 * design mounted.
 */

import {
  REGION_ATTRIBUTE,
  REGION_NAME_ATTRIBUTE,
  type AnchorElement,
} from "./anchor.ts";

export const PLACE_TEXT_MAX = 40;
export const PLACE_FALLBACK = "this part of the page";

/** "Pricing table", or "\"Choose annual\"", or "this part of the page". */
export function placeName(root: AnchorElement, element: AnchorElement): string {
  for (
    let at: AnchorElement | null = element;
    at && at !== root;
    at = at.parentElement
  ) {
    if (at.getAttribute(REGION_ATTRIBUTE)) {
      const name = at.getAttribute(REGION_NAME_ATTRIBUTE)?.trim();
      if (name) return name;
    }
  }
  const text = (element.textContent ?? "").replace(/\s+/g, " ").trim();
  if (!text) return PLACE_FALLBACK;
  const cut =
    text.length > PLACE_TEXT_MAX
      ? `${text.slice(0, PLACE_TEXT_MAX - 1).trimEnd()}…`
      : text;
  return `"${cut}"`;
}
