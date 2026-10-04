/**
 * contrast-audit (STK-19 C1): the audit passes the repo's preset and fails a
 * synthetic preset whose pairs sit below WCAG AA. Fixtures are written to
 * $TMPDIR; every value in them is synthetic.
 */

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";

import { REPO_ROOT } from "./lib/docs.ts";

const SCRIPT = path.join(REPO_ROOT, "tooling/contrast-audit.ts");
const scratch = mkdtempSync(path.join(tmpdir(), "contrast-audit-"));
after(() => rmSync(scratch, { recursive: true, force: true }));

/** A complete preset: every audited token set, light under :root, dark under .dark. */
function preset(overrides: { light?: string; dark?: string } = {}): string {
  return `
@custom-variant dark (&:where(.dark, .dark *));
:root {
  --step-white: #ffffff;
  --step-black: oklch(0 0 0);
}
:root {
  --background: var(--step-white);
  --foreground: var(--step-black);
  --muted: var(--step-white);
  --muted-foreground: var(--step-black);
  --accent: var(--step-white);
  --accent-foreground: var(--step-black);
  --primary: var(--step-black);
  --primary-foreground: var(--step-white);
  --ring: var(--step-black);
  ${overrides.light ?? ""}
}
.dark {
  --background: var(--step-black);
  --foreground: var(--step-white);
  --muted: var(--step-black);
  --muted-foreground: var(--step-white);
  --accent: var(--step-black);
  --accent-foreground: var(--step-white);
  --primary: var(--step-white);
  --primary-foreground: var(--step-black);
  --ring: var(--step-white);
  ${overrides.dark ?? ""}
}`;
}

function audit(css?: string) {
  const args = [SCRIPT];
  if (css !== undefined) {
    const file = path.join(
      scratch,
      `preset-${Math.random().toString(36).slice(2)}.css`,
    );
    writeFileSync(file, css);
    args.push(file);
  }
  const run = spawnSync(process.execPath, args, { encoding: "utf8" });
  return { status: run.status, out: run.stdout + run.stderr };
}

test("C1: the repo's preset passes every pair in both themes", () => {
  const { status, out } = audit();
  assert.equal(status, 0, out);
  assert.match(out, /all 18 pairs pass/);
});

test("C1: black on white measures 21:1, the WCAG maximum", () => {
  const { status, out } = audit(preset());
  assert.equal(status, 0, out);
  assert.match(
    out,
    /light --foreground on --background \(body text\): 21\.00:1/,
  );
});

test("C1: a text pair below 4.5:1 fails and is named", () => {
  // #777777 on white is 4.48:1, just under AA.
  const { status, out } = audit(
    preset({ light: "--muted-foreground: #777777;" }),
  );
  assert.equal(status, 1, out);
  assert.match(
    out,
    /FAIL\s+light --muted-foreground on --background \(muted text\): 4\.48:1, needs 4\.5:1/,
  );
  assert.match(out, /3 of 18 pairs/);
});

test("C1: a focus ring below 3:1 fails in the theme it is set in", () => {
  // oklch(0.4 0 0) on oklch(0) black is about 2.3:1.
  const { status, out } = audit(preset({ dark: "--ring: oklch(0.4 0 0);" }));
  assert.equal(status, 1, out);
  assert.match(out, /FAIL\s+dark --ring on --background \(focus ring\)/);
  assert.doesNotMatch(out, /FAIL\s+light --ring/);
});

test("C1: see-through text is composited as the browser does", () => {
  // White at 30% over black renders as about #5a5a5a: 2.9:1, not the 7:1 a
  // linear-light blend would report.
  const { status, out } = audit(
    preset({ dark: "--muted-foreground: rgb(255 255 255 / 30%);" }),
  );
  assert.equal(status, 1, out);
  assert.match(
    out,
    /FAIL\s+dark --muted-foreground on --background \(muted text\): 2\.\d\d:1/,
  );
});

test("C1: a missing token fails rather than passing silently", () => {
  const { status, out } = audit(
    preset().replace(/--ring: var\(--step-black\);/, ""),
  );
  assert.equal(status, 1, out);
  assert.match(out, /ERROR light --ring on --background/);
});
