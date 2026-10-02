/**
 * review:run and the epic path: pre-flight, review binding, promotion (J5; A13.2). Scratch repos in $TMPDIR with real git; see
 * tooling/lib/scratch-repo.ts. Every repo, file and verdict is synthetic.
 */

import assert from "node:assert/strict";
import { rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
  AS_BUILT,
  buildAndProve,
  checkSpecs,
  commit,
  exec,
  freshRepo,
  git,
  oneOffContract,
  read,
  startOneOff,
  tool,
  useScratchRepo,
  write,
} from "./lib/scratch-repo.ts";

useScratchRepo();

test("Vigil 9 and 10, epic: pre-flight gates the start, review:run binds the as-built, truth:promote follows", () => {
  const repo = freshRepo();
  let r = tool(repo, "spec-init.ts", ["web", "OB2", "onboarding"]);
  assert.equal(r.status, 0, r.out);
  assert.equal(git(repo, "rev-parse", "--abbrev-ref", "HEAD"), "agent/OB2");
  const truth = "specs/web/ux/onboarding/welcome.md";
  write(
    repo,
    truth,
    "---\nstatus: approved\n---\n\n# Welcome (synthetic)\n- OB2-W1: the welcome names the next step.\n",
  );
  write(
    repo,
    "specs/web/epics/OB2-onboarding/ux/onboarding/welcome.md",
    `---\ntarget: ${truth}\nstatus: approved\npromoted:\n---\n\n# Welcome, v2 (synthetic)\n- OB2-W1: the welcome names the next step and the time it takes.\n`,
  );
  const draft = path.join(repo, "draft.md");
  writeFileSync(draft, oneOffContract("OB2-1", { cites: [truth, "OB2-W1"] }));
  r = tool(repo, "contract.ts", [
    "init",
    "OB2",
    "welcome",
    "--from",
    draft,
    "--draft",
  ]);
  assert.equal(r.status, 0, r.out);
  rmSync(draft);
  commit(repo, "OB2: tickets drafted");

  // Vigil 8: no pre-flight line, refused.
  r = tool(repo, "contract.ts", ["init", "OB2", "welcome"]);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /no pre-flight line for OB2-1/);
  r = tool(repo, "review-run.ts", ["vigil", "OB2"], {
    PEM_REVIEW_RUNNER: path.join(repo, "review-runner.ts"),
  });
  assert.equal(r.status, 0, r.out);
  assert.match(
    read(repo, "specs/web/epics/OB2-onboarding/tickets/_preflight.md"),
    /^- OB2-1: PASS \(contract [0-9a-f]{12}\)/m,
  );
  commit(repo, "OB2: pre-flight");
  r = tool(repo, "contract.ts", ["init", "OB2", "welcome"]);
  assert.equal(r.status, 0, r.out);
  assert.match(
    read(
      repo,
      "specs/web/epics/OB2-onboarding/tickets/OB2-1-welcome/contract.md",
    ),
    /review:vigil/,
  );

  write(
    repo,
    "src/welcome.ts",
    "export const welcome = 'Next: add a record (two minutes).';\n",
  );
  commit(repo, "OB2-1: welcome");
  r = tool(repo, "contract.ts", ["run", "OB2-1"]);
  assert.equal(r.status, 0, r.out);

  // Vigil 4: a review is never recorded by pointing at a file.
  write(
    repo,
    "specs/web/epics/OB2-onboarding/tickets/OB2-1-welcome/my-review.md",
    "VERDICT: PASS\n",
  );
  r = tool(repo, "contract.ts", [
    "record",
    "OB2-1",
    "review:vigil",
    "--evidence",
    "specs/web/epics/OB2-onboarding/tickets/OB2-1-welcome/my-review.md",
  ]);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /yarn review:run vigil OB2-1/);
  rmSync(
    path.join(
      repo,
      "specs/web/epics/OB2-onboarding/tickets/OB2-1-welcome/my-review.md",
    ),
  );

  // A13.2: the as-built comes before the review.
  const runner = { PEM_REVIEW_RUNNER: path.join(repo, "review-runner.ts") };
  r = tool(repo, "review-run.ts", ["vigil", "OB2-1"], runner);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /write .*as-built\.md first/);
  const asBuilt =
    "specs/web/epics/OB2-onboarding/tickets/OB2-1-welcome/as-built.md";
  write(repo, asBuilt, AS_BUILT("OB2-1"));

  // Vigil 7: closure with review:vigil FAIL fails.
  r = tool(repo, "review-run.ts", ["vigil", "OB2-1"], {
    ...runner,
    PEM_FIXTURE_VERDICT: "FAIL",
  });
  assert.notEqual(r.status, 0);
  r = checkSpecs(repo);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /review:vigil .* not PASS/);

  // ... and with every criterion PASS and run records, it passes.
  r = tool(repo, "review-run.ts", ["vigil", "OB2-1"], runner);
  assert.equal(r.status, 0, r.out);
  assert.match(
    read(
      repo,
      "specs/web/epics/OB2-onboarding/tickets/OB2-1-welcome/review-vigil.md",
    ),
    /^- contract_sha256: [0-9a-f]{64}$/m,
  );
  r = tool(repo, "truth-promote.ts", ["OB2"]);
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /1 promoted/);
  assert.match(read(repo, truth), /the time it takes/);
  commit(repo, "OB2-1: as-built, review, promotion");
  r = checkSpecs(repo);
  assert.equal(r.status, 0, r.out);
  assert.match(
    tool(repo, "status.ts", ["--epic", "OB2"]).out,
    /1\. OB2-1 welcome \(closed\)/,
  );

  // A13.2: editing the as-built after the review resets it.
  write(
    repo,
    asBuilt,
    AS_BUILT("OB2-1").replace("Nothing.", "Something else."),
  );
  r = checkSpecs(repo);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /the as-built changed after this review/);
});

test("a fixture reviewer's PASS does not count outside the harness", () => {
  const repo = startOneOff({ truth: ["specs/web/ux/records/table.md"] });
  buildAndProve(repo);
  write(repo, "specs/web/one-offs/WEB-1-filter/as-built.md", AS_BUILT("WEB-1"));
  let r = tool(repo, "review-run.ts", ["vigil", "WEB-1"], {
    PEM_REVIEW_RUNNER: path.join(repo, "review-runner.ts"),
  });
  assert.equal(r.status, 0, r.out);
  r = exec(
    repo,
    process.execPath,
    [path.join(repo, "tooling/check-specs.ts"), "--skip-fixtures"],
    { PEM_SPECS_FIXTURE: "" },
  );
  assert.notEqual(r.status, 0);
  assert.match(r.out, /fixture runner/);
});
