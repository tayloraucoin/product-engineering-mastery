/**
 * C1: brand.ts's theme colours equal the preset's, and the check fails when
 * either side changes (D-STK-9). The preset is read from @pem/config, so this
 * runs again whenever preset.css changes (this package's turbo.json).
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { brand } from "./brand.ts";

type Scheme = "light" | "dark";
type Theme = Record<string, Record<Scheme, string>>;

/** Each theme colour in brand.ts, and the preset custom property it mirrors. */
const TOKENS: Record<keyof typeof brand.theme, string> = {
  primary: "--primary",
  primaryForeground: "--primary-foreground",
};

const presetPath = fileURLToPath(
  import.meta.resolve("@pem/config/tailwind/preset.css"),
);
const preset = readFileSync(presetPath, "utf8");

/** Custom properties declared in the blocks whose selector is exactly `selector`. */
function declarations(css: string, selector: string): Map<string, string> {
  const found = new Map<string, string>();
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const block of withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    // The text before `{`, after any at-rule statement that precedes it.
    if (block[1]!.split(";").pop()!.trim() !== selector) continue;
    for (const [, name, value] of block[2]!.matchAll(
      /(--[\w-]+)\s*:\s*([^;]+);/g,
    )) {
      found.set(name!, value!.trim());
    }
  }
  return found;
}

/** Follows var(--x) through the raw scale to the literal value. */
function resolve(value: string, root: Map<string, string>): string {
  const reference = /^var\((--[\w-]+)\)$/.exec(value);
  if (!reference) return value;
  const next = root.get(reference[1]!);
  if (next === undefined) throw new Error(`${reference[1]} is not declared`);
  return resolve(next, root);
}

/** Every theme colour whose brand.ts value differs from the preset, named. */
function findThemeMismatches(css: string, theme: Theme): string[] {
  const root = declarations(css, ":root");
  const schemes: Record<Scheme, Map<string, string>> = {
    light: root,
    dark: declarations(css, ".dark"),
  };
  const mismatches: string[] = [];
  for (const [key, token] of Object.entries(TOKENS)) {
    for (const scheme of ["light", "dark"] as const) {
      const declared = schemes[scheme].get(token);
      const expected =
        declared === undefined ? "(missing)" : resolve(declared, root);
      const actual = theme[key]![scheme];
      if (actual !== expected) {
        mismatches.push(
          `brand.theme.${key}.${scheme} is ${actual}; preset ${token} (${scheme}) is ${expected}`,
        );
      }
    }
  }
  return mismatches;
}

test("C1: brand.ts theme colours equal the preset's values", () => {
  assert.deepEqual(findThemeMismatches(preset, brand.theme), []);
});

test("C1: a changed preset value is a mismatch", () => {
  const changed = preset.replace(
    /--neutral-900:\s*[^;]+;/,
    "--neutral-900: oklch(0.5 0.2 250);",
  );
  assert.notEqual(changed, preset, "the raw step behind --primary was found");
  const mismatches = findThemeMismatches(changed, brand.theme);
  assert.ok(
    mismatches.some((line) => line.startsWith("brand.theme.primary.light")),
    mismatches.join("\n"),
  );
});

test("C1: a changed brand.ts value is a mismatch", () => {
  const changed = {
    ...brand.theme,
    primaryForeground: {
      ...brand.theme.primaryForeground,
      dark: "oklch(0.5 0.2 250)",
    },
  };
  assert.deepEqual(findThemeMismatches(preset, changed), [
    `brand.theme.primaryForeground.dark is oklch(0.5 0.2 250); preset --primary-foreground (dark) is ${brand.theme.primaryForeground.dark}`,
  ]);
});

test("every asset path in brand.ts exists in the package", () => {
  for (const path of Object.values(brand.assets)) {
    assert.ok(
      existsSync(new URL(`../${path}`, import.meta.url)),
      `${path} is missing`,
    );
  }
});
