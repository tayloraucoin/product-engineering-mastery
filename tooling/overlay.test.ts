/**
 * The overlay tier on a single-app repo (MIG T3): the scripts and hooks a
 * target installs, run as subprocesses on a scratch repo shaped like one
 * (tooling/lib/scratch-repo.ts, singleAppRepo), with and without a specs
 * root. Every repo, file and transcript here is synthetic. MIG-2 and MIG-3
 * add their cases here.
 */

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, rmSync, symlinkSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";

import {
  exec,
  read,
  singleAppRepo,
  tool,
  useScratchRepo,
  write,
} from "./lib/scratch-repo.ts";

useScratchRepo();

const REPO_ROOT = path.resolve(import.meta.dirname, "..");

const TYPE_ERROR =
  'export const sum = (a: number, b: number): number => a + b;\nexport const broken: number = "not a number";\n';
const CLEAN_EDIT =
  "export const sum = (a: number, b: number): number => a + b;\nexport const twice = (n: number): number => sum(n, n);\n";

/** verify:fast as the stop gate runs it: scoped to the given files, or the whole branch. */
const verifyFast = (
  repo: string,
  files?: string[],
  env: Record<string, string> = {},
) =>
  exec(repo, "yarn", ["verify:fast"], {
    ...env,
    ...(files ? { PEM_VERIFY_FAST_FILES: files.join("\n") } : {}),
  });

/** A hook as Claude Code runs it: the event on stdin, the project dir set. */
function hook(repo: string, script: string, input: Record<string, unknown>) {
  const result = spawnSync(
    process.execPath,
    [path.join(repo, "tooling/hooks", script)],
    {
      cwd: repo,
      input: JSON.stringify(input),
      encoding: "utf8",
      env: { ...process.env, CLAUDE_PROJECT_DIR: repo },
    },
  );
  return {
    status: result.status ?? 1,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

/** A transcript holding one Edit of `file`, the record the stop gate reads (PR-15). */
function transcriptEditing(repo: string, file: string): string {
  const rel = "transcript.jsonl";
  const records = [
    {
      type: "user",
      isSidechain: false,
      message: { role: "user", content: "synthetic prompt" },
    },
    {
      type: "assistant",
      isSidechain: false,
      message: {
        role: "assistant",
        content: [
          {
            type: "tool_use",
            name: "Edit",
            input: { file_path: path.join(repo, file) },
          },
        ],
        usage: { input_tokens: 1000, output_tokens: 10 },
      },
    },
  ];
  write(repo, rel, records.map((r) => JSON.stringify(r)).join("\n") + "\n");
  return path.join(repo, rel);
}

/** The steps a run counted, from its summary line's timings. */
const ranSteps = (out: string) =>
  out.match(/^verify:fast — .*?s: (.*)\.$/m)?.[1] ?? "";

for (const specsRoot of [false, true]) {
  const variant = specsRoot ? "with a specs root" : "without a specs root";

  describe(`single-app overlay repo, ${variant}`, () => {
    test(`C2 verify:fast exits 0 on a clean edit, ${variant}`, () => {
      const repo = singleAppRepo({ specsRoot });
      write(repo, "src/sum.ts", CLEAN_EDIT);
      const r = verifyFast(repo, ["src/sum.ts"]);
      assert.equal(r.status, 0, r.out);
      assert.match(ranSteps(r.out), /types \(check-types\)/);
    });

    test(`C2 verify:fast exits 1 on a type error, naming the type-check step, ${variant}`, () => {
      const repo = singleAppRepo({ specsRoot });
      write(repo, "src/sum.ts", TYPE_ERROR);
      const scoped = verifyFast(repo, ["src/sum.ts"]);
      assert.equal(scoped.status, 1, scoped.out);
      assert.match(scoped.out, /types \(check-types\) failed/);
      assert.match(scoped.out, /TS2322/);
      // Unscoped, the branch diff finds the same file.
      const branch = verifyFast(repo);
      assert.equal(branch.status, 1, branch.out);
      assert.match(branch.out, /types \(check-types\) failed/);
    });

    test(`C3 the stop gate passes a clean edit without blocking, and verify:fast names what it did not run, ${variant}`, () => {
      const repo = singleAppRepo({ specsRoot });
      write(repo, "src/sum.ts", CLEAN_EDIT);
      const stop = hook(repo, "stop-gate.ts", {
        hook_event_name: "Stop",
        session_id: `overlay-c3-${specsRoot}-${process.pid}`,
        stop_hook_active: false,
        transcript_path: transcriptEditing(repo, "src/sum.ts"),
        cwd: repo,
      });
      assert.equal(stop.status, 0, stop.stderr);
      const reply = JSON.parse(stop.stdout) as Record<string, unknown>;
      assert.equal(reply.decision, undefined, stop.stdout);
      assert.match(String(reply.systemMessage), /verify:fast passed/);

      // The run the gate made: the same files, scoped the same way.
      const r = verifyFast(repo, ["src/sum.ts"]);
      assert.equal(r.status, 0, r.out);
      for (const line of [
        "not run: format (changed files) (prettier is not a root dependency)",
        "not run: lint and types via Turbo (no turbo.json)",
        "not run: lint (changed code) (no ESLint config)",
        "not run: types (tooling) (no check-types:tooling script)",
        "not run: docs lint (no lint:docs script)",
        "not run: settings (no check-settings script)",
        "not run: hook fixtures (no test:hooks script)",
        "not run: check-specs (no check-specs script)",
      ])
        assert.ok(r.out.includes(line), `missing "${line}" in:\n${r.out}`);
      // A step that cannot run is never among the steps counted.
      assert.doesNotMatch(ranSteps(r.out), /format|Turbo|lint|tooling/);
    });

    test(`C3 the stop gate blocks a type error once, quoting the failed step, ${variant}`, () => {
      const repo = singleAppRepo({ specsRoot });
      write(repo, "src/sum.ts", TYPE_ERROR);
      const stop = hook(repo, "stop-gate.ts", {
        hook_event_name: "Stop",
        session_id: `overlay-c3-red-${specsRoot}-${process.pid}`,
        stop_hook_active: false,
        transcript_path: transcriptEditing(repo, "src/sum.ts"),
        cwd: repo,
      });
      assert.equal(stop.status, 0, stop.stderr);
      const reply = JSON.parse(stop.stdout) as Record<string, unknown>;
      assert.equal(reply.decision, "block", stop.stdout);
      assert.match(String(reply.reason), /types \(check-types\) failed/);
      assert.match(String(reply.reason), /TS2322/);
    });

    test(`C5 budget exits 0 and names the files it skipped, ${variant}`, () => {
      const repo = singleAppRepo({ specsRoot });
      const r = exec(repo, "yarn", ["budget"]);
      assert.equal(r.status, 0, r.out);
      assert.match(r.out, /within every cap/);
      const skip = r.out.match(
        /^SKIP not in this repo, so not counted: (.*)$/m,
      );
      assert.ok(skip, `no SKIP line in:\n${r.out}`);
      for (const rel of [
        "docs/design/canon.md",
        "packages/ui/src/primitives/control/button/button.tsx",
        "tooling/fixtures/budget/over-cap-index.md",
      ])
        assert.ok(skip[1]!.includes(rel), `${rel} not named in: ${skip[1]}`);
      // The specs probe is skipped only when the specs root is absent.
      assert.equal(
        skip[1]!.includes("specs/web/one-offs/WEB-1-filter/contract.md"),
        !specsRoot,
      );
    });

    test(`C5 budget reads a nested AGENTS.md under the root code root, ${variant}`, () => {
      const repo = singleAppRepo({ specsRoot });
      write(repo, "src/AGENTS.md", `# Src\n\n${"word ".repeat(2000)}\n`);
      const r = exec(repo, "yarn", ["budget"]);
      assert.equal(r.status, 1, r.out);
      assert.match(
        r.out,
        /path rules and nested AGENTS\.md.*over the 1500 cap/,
      );
    });
  });
}

test("C5 results-gate exits 0 with no decision when the specs root is absent", () => {
  const repo = singleAppRepo();
  for (const file of ["src/sum.ts", "AGENTS.md", "toolkit.json"]) {
    const r = hook(repo, "results-gate.ts", {
      tool_name: "Write",
      tool_input: { file_path: path.join(repo, file), content: "x" },
    });
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.stdout, "");
    assert.equal(r.stderr, "");
  }
});

test("C5 with a specs root, results-gate still blocks a results.json write", () => {
  const repo = singleAppRepo({ specsRoot: true });
  const r = hook(repo, "results-gate.ts", {
    tool_name: "Write",
    tool_input: {
      file_path: path.join(repo, "specs/web/one-offs/WEB-001-x/results.json"),
      content: "{}",
    },
  });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /results-gate \[results\]/);
});

test("C4 a Turbo task missing from turbo.json is named as not run and never counted", () => {
  const repo = singleAppRepo({ turboTasks: ["build", "lint"] });
  write(repo, "src/sum.ts", CLEAN_EDIT);
  const r = verifyFast(repo, ["src/sum.ts"]);
  assert.equal(r.status, 0, r.out);
  assert.ok(
    r.out.includes(
      "not run: lint and types via Turbo (turbo.json has no check-types task)",
    ),
    r.out,
  );
  // The fallback ran the type check instead; Turbo was never counted.
  assert.match(ranSteps(r.out), /types \(check-types\)/);
  assert.doesNotMatch(ranSteps(r.out), /Turbo|affected workspaces/);
});

test("C4 a toolkit step whose script is absent is named as not run even when its inputs changed", () => {
  const repo = singleAppRepo();
  write(repo, "docs/guide.md", "# Guide\n");
  write(repo, "tooling/lib/extra.ts", "export const extra = 1;\n");
  const r = verifyFast(repo, ["docs/guide.md", "tooling/lib/extra.ts"]);
  assert.equal(r.status, 0, r.out);
  assert.ok(r.out.includes("not run: docs lint (no lint:docs script)"), r.out);
  assert.ok(
    r.out.includes("not run: types (tooling) (no check-types:tooling script)"),
    r.out,
  );
  assert.equal(ranSteps(r.out), "nothing to check");
});

test("C4 a step whose script exists runs: the budget is counted, unscoped", () => {
  const repo = singleAppRepo({ scripts: { "lint:docs": "node -e 0" } });
  write(repo, "docs/guide.md", "# Guide\n");
  const r = verifyFast(repo);
  assert.equal(r.status, 0, r.out);
  assert.match(ranSteps(r.out), /docs lint .* s, budget .* s/);
  assert.doesNotMatch(r.out, /not run: docs lint/);
  assert.match(r.out, /not run: check-specs \(no check-specs script\)/);
});

test("C4 turbo.json with both tasks but no Turbo installed is named as not run, and the fallback runs", () => {
  const repo = singleAppRepo({ turboTasks: ["lint", "check-types"] });
  write(repo, "src/sum.ts", CLEAN_EDIT);
  const r = verifyFast(repo, ["src/sum.ts"]);
  assert.equal(r.status, 0, r.out);
  assert.ok(
    r.out.includes(
      "not run: lint and types via Turbo (turbo is not a root dependency)",
    ),
    r.out,
  );
  assert.match(ranSteps(r.out), /types \(check-types\)/);
});

test("C2 a config change under the code root runs the type check", () => {
  const repo = singleAppRepo();
  write(
    repo,
    "tsconfig.json",
    JSON.stringify({
      compilerOptions: { strict: true, noEmit: true, target: "es2022" },
      include: ["src"],
      files: ["src/missing.ts"],
    }),
  );
  const r = verifyFast(repo, ["tsconfig.json"]);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /types \(check-types\) failed/);
});

/** ESLint through a script of its name (Yarn runs a script before a binary), over this repo's install. */
const ESLINT = {
  config:
    'export default [{ files: ["**/*.{js,jsx}"], languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } }, rules: { "no-unused-vars": "error" } }];\n',
  script: { eslint: "node node_modules/eslint/bin/eslint.js" },
};
function eslintRepo(installed: boolean) {
  const repo = singleAppRepo({ scripts: installed ? ESLINT.script : {} });
  if (installed)
    symlinkSync(
      path.join(REPO_ROOT, "node_modules/eslint"),
      path.join(repo, "node_modules/eslint"),
    );
  write(repo, "eslint.config.mjs", ESLINT.config);
  return repo;
}

test("C2 with an ESLint config the fallback lints a changed .jsx file, and a lint error fails naming the step", () => {
  const repo = eslintRepo(true);
  write(repo, "src/view.jsx", "export const View = () => <p>ok</p>;\n");
  const clean = verifyFast(repo, ["src/view.jsx"]);
  assert.equal(clean.status, 0, clean.out);
  assert.match(ranSteps(clean.out), /lint \(changed code\)/);
  assert.doesNotMatch(clean.out, /not run: lint \(changed code\)/);

  write(
    repo,
    "src/view.jsx",
    "const unused = 1;\nexport const View = () => <p>ok</p>;\n",
  );
  const red = verifyFast(repo, ["src/view.jsx"]);
  assert.equal(red.status, 1, red.out);
  assert.match(red.out, /lint \(changed code\) failed/);
  assert.match(red.out, /no-unused-vars/);
});

test("C4 an ESLint config with no ESLint installed is named as not run, never a blocked stop", () => {
  const repo = eslintRepo(false);
  write(
    repo,
    "src/view.jsx",
    "const unused = 1;\nexport const View = () => <p>ok</p>;\n",
  );
  const r = verifyFast(repo, ["src/view.jsx"]);
  assert.equal(r.status, 0, r.out);
  assert.ok(
    r.out.includes(
      "not run: lint (changed code) (eslint is not a root dependency)",
    ),
    r.out,
  );
  assert.doesNotMatch(ranSteps(r.out), /lint/);
});

const UNUSED_JS = "const unused = 1;\nexport const one = 1;\n";
const ESLINTRC = JSON.stringify({
  root: true,
  parserOptions: { ecmaVersion: 2022, sourceType: "module" },
  rules: { "no-unused-vars": "error" },
});

test("C2 an .eslintrc config lints in eslintrc mode, without the flat-config-only flag", () => {
  const repo = eslintRepo(true);
  rmSync(path.join(repo, "eslint.config.mjs"));
  write(repo, ".eslintrc.json", ESLINTRC);
  const eslintrc = { ESLINT_USE_FLAT_CONFIG: "false" };
  write(repo, "src/one.js", "export const one = 1;\n");
  const clean = verifyFast(repo, ["src/one.js"], eslintrc);
  assert.equal(clean.status, 0, clean.out);
  assert.match(ranSteps(clean.out), /lint \(changed code\)/);
  write(repo, "src/one.js", UNUSED_JS);
  const red = verifyFast(repo, ["src/one.js"], eslintrc);
  assert.equal(red.status, 1, red.out);
  assert.match(red.out, /lint \(changed code\) failed/);
  assert.match(red.out, /no-unused-vars/);
});

test("C4 an ESLint that cannot start (exit 2) is named as not run, never a pass or a blocked stop", () => {
  // ESLint 9 in flat mode finds no eslint.config.* beside an .eslintrc and exits 2.
  const repo = eslintRepo(true);
  rmSync(path.join(repo, "eslint.config.mjs"));
  write(repo, ".eslintrc.json", ESLINTRC);
  write(repo, "src/one.js", UNUSED_JS);
  const r = verifyFast(repo, ["src/one.js"]);
  assert.equal(r.status, 0, r.out);
  assert.match(
    r.out,
    /^not run: lint \(changed code\) \(could not start: .+\)$/m,
  );
  assert.doesNotMatch(ranSteps(r.out), /lint/);
});

test("C4 a type-check script that runs an uninstalled Turbo is named as not run, never a blocked stop", () => {
  const repo = singleAppRepo({
    turboTasks: ["lint", "check-types"],
    scripts: { "check-types": "turbo run check-types" },
  });
  write(repo, "src/sum.ts", TYPE_ERROR);
  // Run under `yarn test:tooling`, PATH carries this repo's own binaries,
  // Turbo among them: drop every entry that holds one.
  const PATH = (process.env.PATH ?? "")
    .split(path.delimiter)
    .filter((dir) => !existsSync(path.join(dir, "turbo")))
    .join(path.delimiter);
  const r = verifyFast(repo, ["src/sum.ts"], { PATH });
  assert.equal(r.status, 0, r.out);
  assert.match(
    r.out,
    /^not run: types \(check-types\) \(could not start: .+\)$/m,
  );
  assert.doesNotMatch(ranSteps(r.out), /types/);
});

test("C2 an ESLint config the change broke fails the lint step, never reads as could not start", () => {
  const repo = eslintRepo(true);
  write(repo, "eslint.config.mjs", "export default [{ rules: { \n");
  write(repo, "src/one.js", "export const one = 1;\n");
  const r = verifyFast(repo, ["eslint.config.mjs", "src/one.js"]);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /lint \(changed code\) failed/);
  assert.doesNotMatch(r.out, /could not start/);
});

/**
 * A two-folder repo: the app at the root and workspace apps/a with its own
 * flat config, ESLint declared only at the root as `rootEslint` gives it.
 */
function workspaceRepo(rootEslint: "dependency" | "script") {
  const repo = singleAppRepo();
  const eslintBin = path.join(REPO_ROOT, "node_modules/eslint/bin/eslint.js");
  const pkg = JSON.parse(read(repo, "package.json"));
  if (rootEslint === "dependency") {
    // A local package standing in for eslint: its binary runs this repo's ESLint.
    write(
      repo,
      "fake-eslint/package.json",
      JSON.stringify({
        name: "eslint",
        version: "9.0.0",
        bin: { eslint: "cli.js" },
      }),
    );
    write(
      repo,
      "fake-eslint/cli.js",
      `#!/usr/bin/env node\nrequire(${JSON.stringify(eslintBin)});\n`,
    );
    pkg.devDependencies = { eslint: "portal:./fake-eslint" };
  } else pkg.scripts.eslint = `node ${eslintBin}`;
  write(
    repo,
    "package.json",
    JSON.stringify({ ...pkg, workspaces: ["apps/*"] }, null, 2),
  );
  write(
    repo,
    "apps/a/package.json",
    JSON.stringify({ name: "a", private: true }),
  );
  write(repo, "apps/a/eslint.config.mjs", ESLINT.config);
  const install = exec(repo, "yarn", ["install"]);
  assert.equal(install.status, 0, install.out);
  for (const name of ["typescript", "yaml"])
    if (!existsSync(path.join(repo, "node_modules", name)))
      symlinkSync(
        path.join(REPO_ROOT, "node_modules", name),
        path.join(repo, "node_modules", name),
      );
  return repo;
}

test("C2 a workspace with its own ESLint config and no ESLint of its own lints through the root's dependency", () => {
  const repo = workspaceRepo("dependency");
  write(repo, "apps/a/one.js", UNUSED_JS);
  const red = verifyFast(repo, ["apps/a/one.js"]);
  assert.equal(red.status, 1, red.out);
  assert.match(red.out, /lint \(changed code\) failed/);
  assert.match(red.out, /no-unused-vars/);
  write(repo, "apps/a/one.js", "export const one = 1;\n");
  const clean = verifyFast(repo, ["apps/a/one.js"]);
  assert.equal(clean.status, 0, clean.out);
  assert.match(ranSteps(clean.out), /lint \(changed code\)/);
});

test("C4 a root script named eslint cannot lint a workspace from its folder, so it is named as not run", () => {
  const repo = workspaceRepo("script");
  write(repo, "apps/a/one.js", UNUSED_JS);
  const r = verifyFast(repo, ["apps/a/one.js"]);
  assert.equal(r.status, 0, r.out);
  assert.ok(
    r.out.includes(
      "not run: lint (changed code) (no eslint dependency in apps/a or the root)",
    ),
    r.out,
  );
});

// MIG-3: the work loop and the generator on the same repo.
const OVERLAY_FIXTURES = "tooling/fixtures/overlay";

test("C3 gen-agents skips a host role file without frontmatter and generates the copied role that opts in", () => {
  const repo = singleAppRepo();
  for (const name of ["host-onboarding.md", "scout-research-lead.md"])
    write(
      repo,
      `docs/roles/${name}`,
      read(REPO_ROOT, `${OVERLAY_FIXTURES}/roles/${name}`),
    );
  const r = tool(repo, "gen-agents.ts", []);
  assert.equal(r.status, 0, r.out);
  assert.deepEqual(readdirSync(path.join(repo, ".claude/agents")), [
    "scout.md",
  ]);
  assert.match(
    read(repo, ".claude/agents/scout.md"),
    /GENERATED by tooling\/gen-agents\.ts from docs\/roles\/scout-research-lead\.md/,
  );
  assert.equal(tool(repo, "gen-agents.ts", ["--check"]).status, 0);
});

test("C4 contract:init for an epic ticket, then status, on the single-app repo with a specs root", () => {
  const repo = singleAppRepo({ specsRoot: true });
  // What the manifest copies and these scripts read: the templates, schemas and brief template.
  for (const rel of [
    "docs/engineering/templates/contract.template.md",
    "docs/engineering/templates/as-built.template.md",
    "docs/engineering/schemas/results.schema.json",
    "docs/engineering/schemas/contract.schema.json",
    "docs/product/brief.template.md",
  ])
    write(repo, rel, read(REPO_ROOT, rel));
  let r = tool(repo, "spec-init.ts", ["_shared", "ACME", "migration"]);
  assert.equal(r.status, 0, r.out);
  r = tool(repo, "contract.ts", ["init", "ACME", "first-slice"]);
  assert.equal(r.status, 0, r.out);
  assert.ok(
    existsSync(
      path.join(
        repo,
        "specs/_shared/epics/ACME-migration/tickets/ACME-001-first-slice/contract.md",
      ),
    ),
  );
  r = tool(repo, "status.ts", []);
  assert.equal(r.status, 0, r.out);
  assert.match(
    read(repo, "specs/_status.md"),
    /\| ACME-1 \| epic ticket \| draft \|.*first-slice/,
  );
  // MIG-3 C8: the target's first verify runs check-specs over exactly this tree.
  r = tool(repo, "check-specs.ts", ["--skip-fixtures"]);
  assert.equal(r.status, 0, r.out);
});

// MIG-2: the settings floor, the operator's local rows and the spine on the same repo.
const SETTINGS_FIXTURES = "tooling/fixtures/settings";
const settingsFixture = (name: string) =>
  JSON.parse(read(REPO_ROOT, `${SETTINGS_FIXTURES}/${name}`)) as {
    settings: Record<string, unknown>;
    local?: Record<string, unknown>;
  };
/** What a team gets on merge: the floor and the two team hooks, tracked. */
const FLOOR_ONLY = JSON.stringify(
  settingsFixture("overlay-c1-pass-floor-only.json").settings,
  null,
  2,
);
/** The operator's rows: the git push deny, bash-guard.ts and stop-gate.ts. */
const OPERATOR_ROWS = settingsFixture(
  "overlay-c2-pass-operator-rows-local.json",
).local!;

function setTier(repo: string, tier: string) {
  const toolkit = JSON.parse(read(repo, "toolkit.json"));
  write(repo, "toolkit.json", JSON.stringify({ ...toolkit, tier }, null, 2));
}
const doctor = (repo: string, localFile: string) =>
  tool(repo, "doctor.ts", ["--local-settings", localFile]);

test("C1 check-settings passes the floor-only tracked file at tier overlay, and fails it at starter", () => {
  const repo = singleAppRepo();
  write(repo, ".claude/settings.json", FLOOR_ONLY);
  const overlay = tool(repo, "check-settings.ts", [".claude/settings.json"]);
  assert.equal(overlay.status, 0, overlay.out);
  setTier(repo, "starter");
  const starter = tool(repo, "check-settings.ts", [".claude/settings.json"]);
  assert.equal(starter.status, 1, starter.out);
  assert.match(starter.out, /permissions\.deny is missing Bash\(git push\)/);
  assert.match(starter.out, /does not register tooling\/hooks\/bash-guard\.ts/);
  assert.match(starter.out, /does not register tooling\/hooks\/stop-gate\.ts/);
  assert.match(starter.out, /sandbox\.enabled must be true/);
});

test("C4 doctor at tier overlay exits 1 naming each operator row the local file lacks, and 0 when it holds them", () => {
  const repo = singleAppRepo();
  write(repo, ".claude/settings.json", FLOOR_ONLY);
  const ROWS = [
    "the git push deny",
    "tooling/hooks/bash-guard.ts on PreToolUse",
    "tooling/hooks/stop-gate.ts on Stop",
  ];

  write(repo, "operator-empty.json", "{}\n");
  let r = doctor(repo, "operator-empty.json");
  assert.equal(r.status, 1, r.out);
  for (const row of ROWS)
    assert.ok(
      r.out.includes(`operator-empty.json lacks the operator row ${row}`),
      `"${row}" not named in:\n${r.out}`,
    );

  // A bare-push deny alone does not stop `git push origin HEAD`.
  write(
    repo,
    "operator-partial.json",
    JSON.stringify({
      permissions: { deny: ["Bash(git push)"] },
      hooks: {
        PreToolUse: (OPERATOR_ROWS.hooks as { PreToolUse: unknown }).PreToolUse,
      },
    }),
  );
  r = doctor(repo, "operator-partial.json");
  assert.equal(r.status, 1, r.out);
  assert.ok(r.out.includes(`lacks the operator row ${ROWS[0]}`), r.out);
  assert.ok(r.out.includes(`lacks the operator row ${ROWS[2]}`), r.out);
  assert.ok(!r.out.includes(`lacks the operator row ${ROWS[1]}`), r.out);

  write(repo, "operator.json", JSON.stringify(OPERATOR_ROWS, null, 2));
  r = doctor(repo, "operator.json");
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /operator\.json: operator rows present/);
});

test("C4 doctor at starter only scans the local file: an empty one passes", () => {
  const repo = singleAppRepo();
  setTier(repo, "starter");
  write(repo, ".claude/settings.json", FLOOR_ONLY);
  write(repo, "operator-empty.json", "{}\n");
  const r = doctor(repo, "operator-empty.json");
  assert.equal(r.status, 0, r.out);
  assert.doesNotMatch(r.out, /operator row/);
  assert.match(r.out, /operator-empty\.json: no credential-shaped strings/);
});

test("C5 session-start names only the spine files that exist, under 600 characters", () => {
  const repo = singleAppRepo();
  const start = () =>
    hook(repo, "session-start.ts", {
      hook_event_name: "SessionStart",
      source: "startup",
      cwd: repo,
    });
  exec(repo, "rm", ["docs/index.md"]);
  let r = start();
  assert.equal(r.status, 0, r.stderr);
  assert.match(
    r.stdout,
    /^Spine \(AGENTS\.md, CLAUDE\.md\) as of [0-9a-f]{7,} \d{4}-\d{2}-\d{2}\. /,
  );
  assert.ok(r.stdout.trim().length <= 600, r.stdout);

  exec(repo, "rm", ["AGENTS.md", "CLAUDE.md"]);
  r = start();
  assert.equal(r.status, 0, r.stderr);
  assert.match(
    r.stdout,
    /^Spine: none of AGENTS\.md, CLAUDE\.md, docs\/index\.md exists\. /,
  );

  // A spine no commit has held yet, as a run stopped part-way leaves it on a
  // branch whose history has never had one.
  exec(repo, "git", ["checkout", "-q", "--orphan", "fresh"]);
  exec(repo, "git", ["add", "-A"]);
  exec(repo, "git", ["commit", "-q", "--no-verify", "-m", "host code"]);
  write(repo, "CLAUDE.md", "# Shim\n");
  r = start();
  assert.match(
    r.stdout,
    /^Spine \(CLAUDE\.md\) as of uncommitted, plus 1 uncommitted edit\(s\): reread them\. /,
  );
});
