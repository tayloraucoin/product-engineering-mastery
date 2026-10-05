/**
 * The token lint (CAT-2, CS-13): one case per rule, each linted as text
 * under a file path inside @pem/ui through that package's own ESLint config,
 * so no probe file is ever written to the tree. Variant selectors pass; raw
 * design values fail.
 */

import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";
import { ESLint } from "eslint";

import { REPO_ROOT } from "./lib/docs.ts";

const eslint = new ESLint({ cwd: path.join(REPO_ROOT, "packages/ui") });
const PROBE = path.join(REPO_ROOT, "packages/ui/src/zz-probe.tsx");

/** The token-lint messages reported for one className string. */
async function lintClass(classes: string): Promise<string[]> {
  const code = `export const Probe = () => <div className="${classes}" />;\n`;
  const [result] = await eslint.lintText(code, { filePath: PROBE });
  return result!.messages
    .filter((message) => message.ruleId === "pem-tokens/no-raw-values")
    .map((message) => message.message);
}

const FAILING: [classes: string, message: RegExp][] = [
  ["px-[13px]", /raw length, time or curve/],
  ["focus-visible:ring-[3px]", /raw length, time or curve/],
  ["duration-[0.35s]", /raw length, time or curve/],
  ["ease-[cubic-bezier(0.2,0,0,1)]", /raw length, time or curve/],
  ["bg-red-500", /Palette utility/],
  ["dark:bg-black/10", /Palette utility/],
  ["text-[#ffffff]", /Raw hex color/],
  ["bg-[oklch(0.5_0_0)]", /Raw color function/],
  ["shadow-md", /Default shadow scale/],
  ["shadow-xs", /Default shadow scale/],
  ["data-open:duration-200", /Raw duration/],
  ["ease-in", /ease-in is banned/],
  // Batch review B1, S1: _-joined literals, other units and case, names.
  ["shadow-[0_8px_24px_var(--x)]", /raw length, time or curve/],
  ["p-[13px_20px]", /raw length, time or curve/],
  ["grid-cols-[240px_1fr]", /raw length, time or curve/],
  ["[box-shadow:0_8px_24px_var(--x)]", /raw length, time or curve/],
  ["text-[12pt]", /raw length, time or curve/],
  ["p-[13PX]", /raw length, time or curve/],
  ["bg-[red]", /Raw colour name/],
  ["text-[black]", /Raw colour name/],
  ["font-['Inter']", /Raw font family/],
];

const PASSING = [
  "data-[size=sm]:px-2 has-[>svg]:px-2.5 group-data-[orientation=vertical]:flex-col",
  "active:not-aria-[haspopup]:translate-y-px aria-invalid:ring-destructive/20",
  "grid-rows-[auto_1fr] transition-[color,box-shadow] max-w-[80%] min-w-[14ch]",
  "w-[calc(var(--sidebar-width-icon)+(--spacing(4)))] translate-x-[calc(100%-2px)]",
  "[--stack-step:0.05] h-[calc(100%-1px)] border-[1px] bg-[transparent] font-[var(--font-display)]",
  "shadow-resting shadow-raised shadow-overlay shadow-modal shadow-none",
  "duration-(--motion-duration-base) ease-(--motion-ease-out) ease-in-out",
  "rounded-xl rounded-4xl ring-3 bg-destructive/10 text-sidebar-accent-foreground",
];

for (const [classes, message] of FAILING) {
  test(`C2: "${classes}" is rejected`, async () => {
    const messages = await lintClass(classes);
    assert.ok(
      messages.some((m) => message.test(m)),
      `expected ${message} for "${classes}", got ${JSON.stringify(messages)}`,
    );
  });
}

for (const classes of PASSING) {
  test(`C2: "${classes}" passes`, async () => {
    assert.deepEqual(await lintClass(classes), []);
  });
}

test("C2: a raw value inside cn() is reported once, and an inline style value is rejected", async () => {
  const code = [
    'import { cn } from "../src/lib/cn";',
    'export const A = () => <div className={cn("shadow-lg", "data-[side=top]:p-2")} />;',
    'export const B = () => <div style={{ color: "red" }} />;',
    "",
  ].join("\n");
  const [result] = await eslint.lintText(code, { filePath: PROBE });
  const messages = result!.messages
    .filter((message) => message.ruleId === "pem-tokens/no-raw-values")
    .map((message) => message.message);
  assert.equal(
    messages.filter((m) => /Default shadow scale/.test(m)).length,
    1,
  );
  assert.ok(messages.some((m) => /Inline style value/.test(m)));
});
