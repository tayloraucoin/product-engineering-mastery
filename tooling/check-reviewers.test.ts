/**
 * Reviewer import rows and check-reviewers (MIG-4; T6): one test or more per
 * contract criterion. The scanner and validation run in process; the check
 * and suggestReviewers run in scratch repos in $TMPDIR (lib/scratch-repo.ts),
 * because both read git's tracked files. Every repo, file and row is
 * synthetic.
 */

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { REPO_ROOT } from "./lib/docs.ts";
import {
  commit,
  exec,
  freshRepo,
  read,
  useScratchRepo,
  write,
} from "./lib/scratch-repo.ts";
import {
  findRowReach,
  importsModule,
  listImportedModules,
} from "./lib/specs.ts";
import { validateToolkit, type ToolkitReviewer } from "./lib/toolkit.ts";

useScratchRepo();

const stripeRow: ToolkitReviewer = {
  imports: ["stripe"],
  role: "warden",
  why: "Payment credentials stay with the processor.",
};

/** Rewrites a scratch repo's toolkit.json with a tier and a reviewer list. */
function setToolkit(repo: string, tier: string, reviewers: unknown[]) {
  const toolkit = JSON.parse(read(repo, "toolkit.json"));
  write(
    repo,
    "toolkit.json",
    JSON.stringify({ ...toolkit, tier, reviewers }, null, 2),
  );
}
const checkReviewers = (repo: string) =>
  exec(repo, process.execPath, ["tooling/check-reviewers.ts"]);

/** This repo's toolkit.json with its reviewer rows replaced. */
const withReviewers = (reviewers: unknown[]) => ({
  ...JSON.parse(readFileSync(path.join(REPO_ROOT, "toolkit.json"), "utf8")),
  reviewers,
});

// ------------------------------------------------------------------ C1

test("C1 every static, re-exported, required and dynamic import is read, subpaths included", () => {
  const source = [
    'import Stripe from "stripe";',
    "import { constructEvent } from 'stripe/webhooks';",
    'import "side-effect";',
    'import type { Session } from "@supabase/ssr";',
    'export * from "re-export";',
    'export { send } from "resend";',
    'const legacy = require("legacy");',
    'const later = await import("dynamic");',
    "import {\n  a,\n  b,\n} from 'multi-line';",
  ].join("\n");
  assert.deepEqual(listImportedModules(source).sort(), [
    "@supabase/ssr",
    "dynamic",
    "legacy",
    "multi-line",
    "re-export",
    "resend",
    "side-effect",
    "stripe",
    "stripe/webhooks",
  ]);
});

test("C1 a module named only in a comment, a string, a template, a regex, a member call or an object key is not an import", () => {
  const source = [
    '// import Stripe from "stripe";',
    '/* const s = require("stripe"); */',
    "const label = \"import Stripe from 'stripe'\";",
    "const name = 'stripe';",
    'const doc = `import "stripe"`;',
    'const pattern = /"stripe"/;',
    'client.require("stripe");',
    'const options = { from: "stripe", require: "stripe" };',
  ].join("\n");
  assert.deepEqual(listImportedModules(source), []);
});

test('C1 JSX text: an apostrophe drops the rest of its line; without one, from "x" in text reads as an import (a known limit)', () => {
  assert.deepEqual(
    listImportedModules(
      'export const A = () => <p>Don\'t import from "stripe"</p>;',
    ),
    [],
  );
  assert.deepEqual(
    listImportedModules('export const B = () => <p>Import from "stripe"</p>;'),
    ["stripe"],
  );
});

test("C1 a module matches itself, its subpaths and a scope wildcard, never a longer name", () => {
  assert.ok(importsModule("stripe", "stripe"));
  assert.ok(importsModule("stripe/webhooks", "stripe"));
  assert.ok(!importsModule("stripe-mock", "stripe"));
  assert.ok(!importsModule("@stripe/stripe-js", "stripe"));
  assert.ok(importsModule("@supabase/ssr", "@supabase/*"));
  assert.ok(!importsModule("@supabase", "@supabase/*"));
  assert.ok(!importsModule("@supabase-community/x", "@supabase/*"));
});

test("C1 an imports row reaches a file outside every glob by its import, and the glob still reaches on its own", () => {
  const row: ToolkitReviewer = { ...stripeRow, glob: "**/billing/**" };
  assert.equal(
    findRowReach(row, "apps/web/app/pricing/card.tsx", ["stripe/webhooks"]),
    "apps/web/app/pricing/card.tsx imports stripe/webhooks",
  );
  assert.equal(
    findRowReach(row, "apps/web/lib/billing/plan.ts", []),
    "apps/web/lib/billing/plan.ts reaches **/billing/**",
  );
  assert.equal(findRowReach(row, "apps/web/app/page.tsx", ["react"]), null);
});

test("C1 in a repo, a file mentioning stripe only in a comment or string matches nothing; one importing stripe/webhooks matches", () => {
  const repo = freshRepo();
  setToolkit(repo, "overlay", [stripeRow]);
  write(
    repo,
    "src/notes/mention.ts",
    '// import Stripe from "stripe";\nexport const vendor = "stripe";\n',
  );
  commit(repo, "PEM: a mention");
  const before = checkReviewers(repo);
  assert.equal(before.status, 1, before.out);
  assert.match(before.out, /reviewers\[0\] \(imports stripe; role warden\)/);

  write(
    repo,
    "src/notes/hook.ts",
    'import { webhooks } from "stripe/webhooks";\nexport const verify = webhooks;\n',
  );
  commit(repo, "PEM: an import");
  const after = checkReviewers(repo);
  assert.equal(after.status, 0, after.out);
});

// ------------------------------------------------------------------ C2

test("C2 validateToolkit rejects a row with neither glob nor imports, naming the row", () => {
  const problems = validateToolkit(
    withReviewers([{ role: "warden", why: "Nothing to match." }]),
  );
  assert.ok(
    problems.some(
      (p) =>
        p.startsWith('"reviewers[0]"') &&
        p.includes("needs a glob, an imports list, or both"),
    ),
    problems.join("\n"),
  );
});

test("C2 validateToolkit rejects an empty imports list and a malformed module, naming each", () => {
  const problems = validateToolkit(
    withReviewers([
      { imports: [], role: "warden", why: "Empty." },
      { imports: ["Stripe SDK", "@x/*/y"], role: "mason", why: "Malformed." },
    ]),
  );
  assert.ok(
    problems.some((p) => p.startsWith('"reviewers[0].imports"')),
    problems.join("\n"),
  );
  assert.ok(
    problems.some((p) => p.startsWith('"reviewers[1].imports[0]"')),
    problems.join("\n"),
  );
  assert.ok(
    problems.some((p) => p.startsWith('"reviewers[1].imports[1]"')),
    problems.join("\n"),
  );
});

test("C2 validateToolkit rejects an unknown row key and a module listed twice, naming each", () => {
  const problems = validateToolkit(
    withReviewers([
      {
        glob: "**/billing/**",
        import: ["stripe"],
        role: "warden",
        why: "Typo.",
      },
      { imports: ["stripe", "stripe"], role: "mason", why: "Twice." },
    ]),
  );
  assert.ok(
    problems.some(
      (p) =>
        p.startsWith('"reviewers[0].import"') &&
        p.includes("is not a reviewer field"),
    ),
    problems.join("\n"),
  );
  assert.ok(
    problems.some((p) => p.startsWith('"reviewers[1].imports[1]" repeats')),
    problems.join("\n"),
  );
});

test("C2 validateToolkit accepts a row with imports and no glob, and a row with both", () => {
  assert.deepEqual(
    validateToolkit(
      withReviewers([
        stripeRow,
        { ...stripeRow, glob: "**/billing/**", role: "mason" },
      ]),
    ),
    [],
  );
});

// ------------------------------------------------------------------ C3

test("C3 suggestReviewers seats mason, warden and chancery on a tracked planned file importing stripe, with the import as the reason", () => {
  const repo = freshRepo();
  write(
    repo,
    "src/pricing/checkout.ts",
    'import Stripe from "stripe";\nexport const client = new Stripe("sk_test_synthetic");\n',
  );
  commit(repo, "PEM: a checkout outside every glob");
  write(
    repo,
    "probe.ts",
    [
      'import { suggestReviewers } from "./tooling/lib/specs.ts";',
      'import { loadToolkit } from "./tooling/lib/toolkit.ts";',
      "const suggested = suggestReviewers(",
      '  { planned_paths: ["src/pricing/checkout.ts", "src/pricing/not-yet.ts"] },',
      "  loadToolkit(),",
      ");",
      "console.log(JSON.stringify(Object.fromEntries(suggested)));",
    ].join("\n"),
  );
  // stdout alone: Node may warn on stderr about the scratch package's module type.
  const run = spawnSync(process.execPath, ["probe.ts"], {
    cwd: repo,
    encoding: "utf8",
  });
  assert.equal(run.status, 0, run.stderr);
  const suggested = JSON.parse(run.stdout) as Record<string, string[]>;
  for (const role of ["mason", "warden", "chancery"])
    assert.deepEqual(
      suggested[role],
      ["src/pricing/checkout.ts imports stripe"],
      `${role}: ${run.stdout}`,
    );
  assert.deepEqual(Object.keys(suggested).sort(), [
    "chancery",
    "mason",
    "warden",
  ]);
});

// ------------------------------------------------------------------ C4

test("C4 at tier overlay, check-reviewers fails naming a row that matches no tracked file, and passes once it is deleted", () => {
  const repo = freshRepo();
  const billing = {
    glob: "src/billing/**",
    role: "mason",
    why: "One-way door: billing.",
  };
  const legal = {
    glob: "**/legal/**",
    role: "chancery",
    why: "Terms, privacy and consent text.",
  };
  write(repo, "src/billing/plan.ts", "export const plan = 1;\n");
  write(
    repo,
    "src/pricing/card.ts",
    'import Stripe from "stripe";\nexport const s = Stripe;\n',
  );
  setToolkit(repo, "overlay", [billing, legal, stripeRow]);
  commit(repo, "PEM: an overlay with a dead row");

  const failing = checkReviewers(repo);
  assert.equal(failing.status, 1, failing.out);
  assert.match(
    failing.out,
    /1 reviewer row\(s\) match no tracked file at tier overlay/,
  );
  assert.match(
    failing.out,
    /reviewers\[1\] \(glob \*\*\/legal\/\*\*; role chancery\)/,
  );
  assert.doesNotMatch(failing.out, /reviewers\[0\]|reviewers\[2\]/);

  setToolkit(repo, "overlay", [billing, stripeRow]);
  commit(repo, "PEM: the dead row deleted");
  const passing = checkReviewers(repo);
  assert.equal(passing.status, 0, passing.out);
  assert.match(passing.out, /2 reviewer rows, each matching/);
});

test("C4 at tier overlay, a row carrying a glob and imports fails when either half matches nothing, naming the half", () => {
  const repo = freshRepo();
  write(
    repo,
    "src/pricing/card.ts",
    'import Stripe from "stripe";\nexport const s = Stripe;\n',
  );
  setToolkit(repo, "overlay", [
    { ...stripeRow, glob: "**/billing/**", role: "mason" },
  ]);
  commit(repo, "PEM: billing renamed away; the stripe import remains");
  const run = checkReviewers(repo);
  assert.equal(run.status, 1, run.out);
  assert.match(
    run.out,
    /reviewers\[0\] \(glob \*\*\/billing\/\*\*; imports stripe; role mason\): its glob matches nothing/,
  );

  write(repo, "src/billing/plan.ts", "export const plan = 1;\n");
  commit(repo, "PEM: a billing file");
  const passing = checkReviewers(repo);
  assert.equal(passing.status, 0, passing.out);
});

test("C4 at tier starter, check-reviewers says it is skipped and exits 0 with the same dead row", () => {
  const repo = freshRepo();
  setToolkit(repo, "starter", [
    { glob: "**/legal/**", role: "chancery", why: "Terms." },
  ]);
  commit(repo, "PEM: a starter with a seat for a module not built");
  const run = checkReviewers(repo);
  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /skipped at tier starter/);
});

// ------------------------------------------------------------------ C5

test("C5 verify runs check-reviewers right after check-settings", () => {
  const pkg = JSON.parse(
    readFileSync(path.join(REPO_ROOT, "package.json"), "utf8"),
  ) as { scripts: Record<string, string> };
  assert.equal(
    pkg.scripts["check-reviewers"],
    "node tooling/check-reviewers.ts",
  );
  const steps = pkg.scripts.verify!.split("&&").map((step) => step.trim());
  const at = steps.indexOf("yarn check-settings");
  assert.ok(at >= 0, pkg.scripts.verify);
  assert.equal(steps[at + 1], "yarn check-reviewers");
});

test("C5 in this repo, at tier starter, check-reviewers exits 0 and says it is skipped", () => {
  const toolkit = JSON.parse(
    readFileSync(path.join(REPO_ROOT, "toolkit.json"), "utf8"),
  ) as { tier: string };
  assert.equal(toolkit.tier, "starter");
  const run = spawnSync(process.execPath, ["tooling/check-reviewers.ts"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
  assert.equal(run.status, 0, `${run.stdout}${run.stderr}`);
  assert.match(run.stdout, /skipped at tier starter/);
});

// ------------------------------------------------------------------ C7

test("C7 the template and this repo's toolkit.json validate, each carrying the seeded import rows", () => {
  for (const file of [
    "toolkit.json",
    "docs/engineering/templates/toolkit.template.json",
  ]) {
    const data = JSON.parse(readFileSync(path.join(REPO_ROOT, file), "utf8"));
    assert.deepEqual(validateToolkit(data), [], file);
    const seated = (module: string) =>
      (data.reviewers as ToolkitReviewer[])
        .filter((row) => row.imports?.includes(module))
        .map((row) => row.role)
        .sort();
    for (const module of ["stripe", "@stripe/*"])
      assert.deepEqual(
        seated(module),
        ["chancery", "mason", "warden"],
        `${file} ${module}`,
      );
    for (const module of [
      "@supabase/*",
      "next-auth",
      "@clerk/*",
      "better-auth",
    ])
      assert.deepEqual(
        seated(module),
        ["mason", "warden"],
        `${file} ${module}`,
      );
    assert.deepEqual(seated("resend"), ["warden"], file);
    for (const ai of ["ai", "openai", "@anthropic-ai/*", "@ai-sdk/*"])
      assert.deepEqual(seated(ai), [], `${file}: no AI row (T11)`);
  }
});
