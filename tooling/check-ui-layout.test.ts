/**
 * check-ui-layout (STK-22): criterion C1, over synthetic package trees built
 * in $TMPDIR. Each case starts from a conforming tree and breaks one thing.
 */

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";

import { checkUiLayout } from "./check-ui-layout.ts";

const scratch = mkdtempSync(path.join(tmpdir(), "check-ui-layout-"));
after(() => rmSync(scratch, { recursive: true, force: true }));

type Tree = Record<string, string>;

const CONFORMING: Tree = {
  "src/primitives/control/button/button.tsx": "export function Button() {}",
  "src/primitives/control/button/button.variants.ts":
    'export const buttonVariants = cva("");',
  "src/primitives/control/button/index.ts": 'export * from "./button";',
  "src/composed/control/theme-toggle/theme-toggle.tsx":
    "export function ThemeToggle() {}",
  "src/composed/control/theme-toggle/copy.ts": "export const COPY = {};",
  "src/composed/control/theme-toggle/index.ts":
    'export * from "./theme-toggle";',
  "src/providers/theme/index.ts": "export {};",
  "src/lib/cn.ts": "export {};",
  "src/styles/globals.css": '@source "../";',
  "package.json": JSON.stringify({
    exports: {
      "./button": {
        types: "./src/primitives/control/button/index.ts",
        default: "./src/primitives/control/button/index.ts",
      },
      "./styles/globals.css": "./src/styles/globals.css",
    },
  }),
};

let n = 0;
/** Writes CONFORMING with `change` applied (a null value removes a file). */
function stage(change: Record<string, string | null> = {}): string {
  const root = path.join(scratch, `case-${n++}`);
  const tree: Record<string, string | null> = { ...CONFORMING, ...change };
  for (const [rel, text] of Object.entries(tree)) {
    if (text === null) continue;
    mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    writeFileSync(path.join(root, rel), text);
  }
  return root;
}

function assertOneProblem(root: string, ...parts: string[]) {
  const problems = checkUiLayout(root);
  assert.equal(problems.length, 1, problems.join("\n"));
  for (const part of parts) assert.match(problems[0]!, new RegExp(part));
}

test("C1: a conforming tree passes", () => {
  assert.deepEqual(checkUiLayout(stage()), []);
});

test("C1: a stray top-level folder fails, naming it", () => {
  assertOneProblem(
    stage({ "src/button/button.tsx": "export {};" }),
    "src/button: not a layout folder",
  );
});

test("C1: an unknown kind fails, naming it", () => {
  assertOneProblem(
    stage({ "src/primitives/widgets/dial/dial.tsx": "export {};" }),
    "src/primitives/widgets: not a kind",
  );
});

test("C1: a component folder without <name>.tsx fails, naming it", () => {
  assertOneProblem(
    stage({ "src/composed/control/theme-toggle/theme-toggle.tsx": null }),
    "src/composed/control/theme-toggle: missing theme-toggle.tsx",
  );
});

test("C1: a component folder without index.ts fails, naming it", () => {
  assertOneProblem(
    stage({ "src/composed/control/theme-toggle/index.ts": null }),
    "src/composed/control/theme-toggle: missing index.ts",
  );
});

test("C1: a cva() in the component file fails, naming the file", () => {
  assertOneProblem(
    stage({
      "src/primitives/control/button/button.tsx":
        'const buttonVariants = cva("");',
    }),
    "button/button.tsx: cva\\(\\) belongs in button.variants.ts",
  );
});

test("C1: an export whose target is missing fails, naming the export", () => {
  assertOneProblem(
    stage({
      "package.json": JSON.stringify({
        exports: { "./button": "./src/button/index.ts" },
      }),
    }),
    'package.json: exports "./button" points at ./src/button/index.ts',
  );
});
