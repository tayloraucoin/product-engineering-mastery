/**
 * The preset carries what shadcn's Vega style uses (CAT-2): every colour role
 * as a Tailwind colour, light and dark; the radius steps; the four elevation
 * levels (CS-11); and the tk-motion tokens with their values verbatim (CS-12).
 * The role list was measured from the 62 resolved base-vega components on
 * 2026-10-04.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { REPO_ROOT } from "./lib/docs.ts";

const css = readFileSync(
  path.join(REPO_ROOT, "packages/config/tailwind/preset.css"),
  "utf8",
).replace(/\/\*[\s\S]*?\*\//g, "");

/** The custom properties declared in every block whose selector is `selector`. */
function declared(selector: string): Set<string> {
  const names = new Set<string>();
  for (const block of css.matchAll(/([^{};]+)\{([^{}]*)\}/g)) {
    if (block[1]!.trim() !== selector) continue;
    for (const decl of block[2]!.matchAll(/(--[\w-]+)\s*:/g))
      names.add(decl[1]!);
  }
  return names;
}

const VEGA_ROLES = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "border",
  "input",
  "ring",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
];
const CHARTS = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"];

const MOTION: Record<string, string> = {
  "--motion-ease-out": "cubic-bezier(0.23, 1, 0.32, 1)",
  "--motion-ease-in-out": "cubic-bezier(0.77, 0, 0.175, 1)",
  "--motion-ease-drawer": "cubic-bezier(0.32, 0.72, 0, 1)",
  "--motion-ease-hover": "ease",
  "--motion-duration-instant": "0ms",
  "--motion-duration-fast": "125ms",
  "--motion-duration-press": "160ms",
  "--motion-duration-base": "180ms",
  "--motion-duration-moderate": "250ms",
  "--motion-duration-sheet": "500ms",
  "--motion-duration-hold": "1500ms",
};

test("C2: every Vega colour role is a Tailwind colour, set in light and in dark", () => {
  const theme = declared("@theme inline");
  const light = declared(":root");
  const dark = declared(".dark");
  for (const role of [...VEGA_ROLES, ...CHARTS]) {
    assert.ok(theme.has(`--color-${role}`), `--color-${role} is not bridged`);
    assert.ok(light.has(`--${role}`), `--${role} is not set under :root`);
  }
  for (const role of [...VEGA_ROLES, ...CHARTS])
    assert.ok(dark.has(`--${role}`), `--${role} is not set under .dark`);
});

test("C2: the radius steps and the four elevation levels are tokens", () => {
  const theme = declared("@theme inline");
  for (const step of ["sm", "md", "lg", "xl", "2xl", "3xl", "4xl"])
    assert.ok(theme.has(`--radius-${step}`), `--radius-${step} missing`);
  for (const level of ["resting", "raised", "overlay", "modal"])
    assert.ok(theme.has(`--shadow-${level}`), `--shadow-${level} missing`);
});

test("C2: the tk-motion tokens carry their values verbatim", () => {
  for (const [name, value] of Object.entries(MOTION)) {
    const match = css.match(new RegExp(`${name}:\\s*([^;]+);`));
    assert.equal(match?.[1]?.trim(), value, `${name}`);
  }
});
