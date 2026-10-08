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
  WORK_BRANCH,
  write,
} from "./lib/scratch-repo.ts";

useScratchRepo();

test("Vigil 9 and 10, Q3 epic ticket: pre-flight gates the start, review:run follows the as-built, truth:promote follows", () => {
  const repo = freshRepo();
  let r = tool(repo, "spec-init.ts", ["web", "OB2", "onboarding"]);
  assert.equal(r.status, 0, r.out);
  assert.equal(git(repo, "rev-parse", "--abbrev-ref", "HEAD"), WORK_BRANCH);
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
  writeFileSync(
    draft,
    oneOffContract("OB2-1", { cites: [truth, "OB2-W1"], qa: "Q3" }),
  );
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
  // O4: the pre-flight header carries the run's cost.
  const preflight = "specs/web/epics/OB2-onboarding/tickets/_preflight.md";
  assert.match(read(repo, preflight), /^- tokens_input: 1200$/m);
  assert.match(read(repo, preflight), /^- seconds: \d+(\.\d+)?$/m);
  commit(repo, "OB2: pre-flight");
  r = tool(repo, "contract.ts", ["init", "OB2", "welcome"]);
  assert.equal(r.status, 0, r.out);
  assert.match(
    read(
      repo,
      "specs/web/epics/OB2-onboarding/tickets/OB2-001-welcome/contract.md",
    ),
    /review:vigil/,
  );
  // Y5: a pre-flight a guard refuses leaves its time and reason in the header,
  // and the PASS line it wrote earlier stays.
  r = tool(repo, "review-run.ts", ["vigil", "OB2"], {
    PEM_REVIEW_RUNNER: path.join(repo, "review-runner.ts"),
  });
  assert.notEqual(r.status, 0);
  assert.match(
    read(repo, preflight),
    /^- refused: \d{4}-\d{2}-\d{2}T[0-9:]+Z: OB2 has no drafted tickets/m,
  );
  assert.match(
    read(repo, preflight),
    /^- OB2-1: PASS \(contract [0-9a-f]{12}\)/m,
  );
  commit(repo, "OB2: refused pre-flight attempt recorded");

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
    "specs/web/epics/OB2-onboarding/tickets/OB2-001-welcome/my-review.md",
    "VERDICT: PASS\n",
  );
  r = tool(repo, "contract.ts", [
    "record",
    "OB2-1",
    "review:vigil",
    "--evidence",
    "specs/web/epics/OB2-onboarding/tickets/OB2-001-welcome/my-review.md",
  ]);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /yarn review:run vigil OB2-1/);
  rmSync(
    path.join(
      repo,
      "specs/web/epics/OB2-onboarding/tickets/OB2-001-welcome/my-review.md",
    ),
  );

  // A13.2: the as-built comes before the review.
  const runner = { PEM_REVIEW_RUNNER: path.join(repo, "review-runner.ts") };
  r = tool(repo, "review-run.ts", ["vigil", "OB2-1"], runner);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /write .*as-built\.md first/);
  // Y5: the refused attempt is on record under the criterion, and status shows it.
  const resultsFile =
    "specs/web/epics/OB2-onboarding/tickets/OB2-001-welcome/results.json";
  const refused = JSON.parse(read(repo, resultsFile)).criteria["review:vigil"]
    .refused as { at: string; reason: string }[];
  assert.equal(refused.length, 1);
  assert.match(refused[0]!.reason, /as-built\.md first/);
  assert.match(
    tool(repo, "status.ts", ["OB2-1"]).out,
    /^  review:vigil: refused \d{4}-\d{2}-\d{2}T[0-9:]+Z: write .*as-built\.md first/m,
  );
  const asBuilt =
    "specs/web/epics/OB2-onboarding/tickets/OB2-001-welcome/as-built.md";
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
  const costHeader = read(
    repo,
    "specs/web/epics/OB2-onboarding/tickets/OB2-001-welcome/review-vigil.md",
  );
  assert.match(costHeader, /^- contract_sha256: [0-9a-f]{64}$/m);
  // O4: the five cost fields, in the review file header and in the run record.
  for (const line of [
    "tokens_input: 1200",
    "tokens_cache_read: 3400",
    "tokens_cache_write: 500",
    "tokens_output: 260",
  ])
    assert.match(costHeader, new RegExp(`^- ${line}$`, "m"));
  assert.match(costHeader, /^- seconds: \d+(\.\d+)?$/m);
  const recorded = JSON.parse(read(repo, resultsFile)).criteria["review:vigil"];
  assert.equal(recorded.run.tokens_input, 1200);
  assert.equal(recorded.run.tokens_cache_read, 3400);
  assert.equal(recorded.run.tokens_cache_write, 500);
  assert.equal(recorded.run.tokens_output, 260);
  assert.equal(typeof recorded.run.seconds, "number");
  assert.equal(
    recorded.refused.length,
    1,
    "a completed run keeps the refusals",
  );
  const status = tool(repo, "status.ts", ["OB2-1"]).out;
  assert.match(
    status,
    /^  review:vigil: PASS, 1,200 in, 3,400 read, 500 write, 260 out, \d+(\.\d+)? s, \d{4}-/m,
  );
  assert.equal(status.match(/^  review:vigil: PASS/gm)?.length, 1);
  // C3: the generated prompt is single-pass and scoped to the planned-path
  // changes, one import hop out only to confirm a Blocking.
  const reviewFile = read(
    repo,
    "specs/web/epics/OB2-onboarding/tickets/OB2-001-welcome/review-vigil.md",
  );
  assert.match(
    reviewFile,
    /^This is the only review pass unless you FAIL it, so list every finding now\./m,
  );
  assert.match(
    reviewFile,
    /Should-fix and Consider findings become follow-ups the builder fixes without reopening the review/,
  );
  assert.match(
    reviewFile,
    /It is a claim to check inside the changed files, not an invitation to read the repo\./,
  );
  assert.match(
    reviewFile,
    /^5\. The changed files, this ticket's planned paths against main .*Judge these changes against the criteria and the non-negotiables\.$/m,
  );
  assert.match(
    reviewFile,
    /^6\. The surface the ticket cites: specs\/web\/ux\/onboarding\/welcome\.md\. Read only the parts the contract names \(OB2-W1\), not the whole file\.$/m,
  );
  assert.match(
    reviewFile,
    /^Stay inside the changed files\. Follow an import one hop out of a changed file only to confirm a Blocking finding, never to look for one, and never further than that hop\.$/m,
  );
  assert.match(
    reviewFile,
    /graded Blocking, Should-fix or Consider, each with a file and line\. A Blocking finding means FAIL; a Should-fix or Consider finding never does\./,
  );
  assert.doesNotMatch(reviewFile, /Check its claims against the code/);
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

  // PR-15: a review binds the code, so an as-built wording fix keeps it.
  write(
    repo,
    asBuilt,
    AS_BUILT("OB2-1").replace("Nothing.", "Something else."),
  );
  r = checkSpecs(repo);
  assert.equal(r.status, 0, r.out);
});

test("a fixture reviewer's PASS does not count outside the harness", () => {
  const repo = startOneOff({
    truth: ["specs/web/ux/records/table.md"],
    qa: "Q3",
  });
  buildAndProve(repo);
  write(
    repo,
    "specs/web/one-offs/WEB-001-filter/as-built.md",
    AS_BUILT("WEB-1"),
  );
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

test("a pre-flight written by the fixture reviewer does not start a ticket outside the harness", () => {
  const repo = freshRepo();
  let r = tool(repo, "spec-init.ts", ["web", "PF", "preflight"]);
  assert.equal(r.status, 0, r.out);
  const surface = "specs/web/ux/preflight/note.md";
  write(
    repo,
    surface,
    "---\nstatus: approved\n---\n\n# Note (synthetic)\n- PF-N1: the note exists.\n",
  );
  const draft = path.join(repo, "draft.md");
  writeFileSync(
    draft,
    oneOffContract("PF-1", { cites: [surface, "PF-N1"], qa: "Q3" }),
  );
  r = tool(repo, "contract.ts", [
    "init",
    "PF",
    "note",
    "--from",
    draft,
    "--draft",
  ]);
  assert.equal(r.status, 0, r.out);
  rmSync(draft);
  r = tool(repo, "review-run.ts", ["vigil", "PF"], {
    PEM_REVIEW_RUNNER: path.join(repo, "review-runner.ts"),
  });
  assert.equal(r.status, 0, r.out);
  commit(repo, "PF: drafted and pre-flighted by the fixture reviewer");
  r = tool(repo, "contract.ts", ["init", "PF", "note"], {
    PEM_SPECS_FIXTURE: "",
  });
  assert.notEqual(r.status, 0);
  assert.match(r.out, /written by a fixture reviewer, not Claude/);
});

// ---------------------------------------------------------------- WEB-12: a PASS is final for its round

const RUNNER = (repo: string) => ({
  PEM_REVIEW_RUNNER: path.join(repo, "review-runner.ts"),
});
const WEB1 = "specs/web/one-offs/WEB-001-filter";
const resultsOf = (repo: string) =>
  JSON.parse(read(repo, `${WEB1}/results.json`)) as {
    criteria_sha256: string;
    criteria: Record<
      string,
      {
        status: string;
        runs?: number;
        refused?: { reason: string }[];
        run: { criteria_sha256?: string } | null;
      }
    >;
  };

test("WEB-12 C1: a review PASS survives an as-built edit and a planned-path commit while the ticket is still closing", () => {
  const repo = startOneOff({ qa: "Q3", reviewers: ["vigil", "warden"] });
  buildAndProve(repo);
  write(repo, `${WEB1}/as-built.md`, AS_BUILT("WEB-1"));
  let r = tool(repo, "review-run.ts", ["vigil", "WEB-1"], RUNNER(repo));
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /This PASS is final for its round/);
  const review = read(repo, `${WEB1}/review-vigil.md`);
  assert.match(review, /^- contract_sha256: [0-9a-f]{64}$/m);
  assert.match(review, /^- criteria_sha256: [0-9a-f]{64}$/m);
  assert.match(review, /^- as_built_sha256: [0-9a-f]{64}$/m);
  assert.match(review, /^- run: 1 of vigil on WEB-1$/m);
  assert.equal(resultsOf(repo).criteria["review:vigil"]!.runs, 1);
  assert.equal(
    resultsOf(repo).criteria["review:vigil"]!.run!.criteria_sha256,
    resultsOf(repo).criteria_sha256,
  );

  // The orange fix: the as-built changes, a planned path changes, the proofs re-run.
  write(
    repo,
    `${WEB1}/as-built.md`,
    AS_BUILT("WEB-1").replace("Nothing.", "A Should-fix finding was fixed."),
  );
  write(
    repo,
    "src/filter.ts",
    "export const keep = (n: number) => Number.isFinite(n) && n > 1;\n",
  );
  commit(repo, "WEB-1: review fix");
  r = tool(repo, "contract.ts", ["run", "WEB-1"]);
  assert.equal(r.status, 0, r.out);

  // Not frozen (warden has not run), staleness asked for: vigil's PASS stands.
  r = checkSpecs(repo);
  assert.notEqual(r.status, 0, "warden is still FAIL, so the close is open");
  assert.doesNotMatch(r.out, /review:vigil's PASS no longer holds/);
  assert.match(r.out, /review:warden \(not proven yet\)/);
  const status = tool(repo, "status.ts", ["WEB-1"]).out;
  assert.match(status, /^  review:warden manual/m);
  assert.doesNotMatch(status, /^  review:vigil manual/m);

  // A second vigil run after the PASS is refused, on record, and the file is untouched.
  const before = read(repo, `${WEB1}/review-vigil.md`);
  r = tool(repo, "review-run.ts", ["vigil", "WEB-1"], RUNNER(repo));
  assert.notEqual(r.status, 0);
  assert.match(r.out, /a PASS is final for its round/);
  assert.match(r.out, /--operator "<reason>"/);
  assert.equal(read(repo, `${WEB1}/review-vigil.md`), before);
  const vigil = resultsOf(repo).criteria["review:vigil"]!;
  assert.equal(vigil.status, "PASS");
  assert.equal(vigil.runs, 1);
  assert.match(vigil.refused!.at(-1)!.reason, /a PASS is final for its round/);

  // Warden runs once; the ticket closes, and the strict check passes.
  r = tool(repo, "review-run.ts", ["warden", "WEB-1"], RUNNER(repo));
  assert.equal(r.status, 0, r.out);
  commit(repo, "WEB-1: as-built and reviews");
  r = checkSpecs(repo);
  assert.equal(r.status, 0, r.out);
});

test("WEB-12 C2: a FAIL earns one re-review; a third run needs --operator, and the reason is written into the review file", () => {
  const repo = startOneOff({ qa: "Q3" });
  buildAndProve(repo);
  write(repo, `${WEB1}/as-built.md`, AS_BUILT("WEB-1"));
  let r = tool(repo, "review-run.ts", ["vigil", "WEB-1"], {
    ...RUNNER(repo),
    PEM_FIXTURE_VERDICT: "FAIL",
  });
  assert.notEqual(r.status, 0);
  assert.match(r.out, /A FAIL earns one re-review/);
  assert.equal(resultsOf(repo).criteria["review:vigil"]!.runs, 1);

  // The second run is the one re-review the FAIL earned.
  r = tool(repo, "review-run.ts", ["vigil", "WEB-1"], RUNNER(repo));
  assert.equal(r.status, 0, r.out);
  assert.match(read(repo, `${WEB1}/review-vigil.md`), /^- run: 2 of vigil/m);
  assert.equal(resultsOf(repo).criteria["review:vigil"]!.runs, 2);

  // The third is refused without the operator's word...
  r = tool(repo, "review-run.ts", ["vigil", "WEB-1"], RUNNER(repo));
  assert.notEqual(r.status, 0);
  assert.match(
    r.out,
    /has run 2 times on WEB-1; a third run needs the operator's word/,
  );
  assert.equal(resultsOf(repo).criteria["review:vigil"]!.runs, 2);
  r = tool(
    repo,
    "review-run.ts",
    ["vigil", "WEB-1", "--operator"],
    RUNNER(repo),
  );
  assert.notEqual(r.status, 0);
  assert.match(r.out, /--operator needs the operator's reason/);

  // ... and runs with it, the reason kept in the file.
  r = tool(
    repo,
    "review-run.ts",
    [
      "vigil",
      "WEB-1",
      "--operator",
      "Taylor: the webhook handler changed shape; look again",
    ],
    RUNNER(repo),
  );
  assert.equal(r.status, 0, r.out);
  const review = read(repo, `${WEB1}/review-vigil.md`);
  assert.match(review, /^- run: 3 of vigil on WEB-1$/m);
  assert.match(
    review,
    /^- operator: Taylor: the webhook handler changed shape; look again$/m,
  );
  assert.equal(resultsOf(repo).criteria["review:vigil"]!.runs, 3);
});

test("WEB-12 C3: a FAIL written by hand earns no run, an edited review file earns none, and contract:add is the one reset", () => {
  // Hand edits: the verdict is read from the hash-bound review file.
  let repo = startOneOff({ qa: "Q3" });
  buildAndProve(repo);
  write(repo, `${WEB1}/as-built.md`, AS_BUILT("WEB-1"));
  let r = tool(repo, "review-run.ts", ["vigil", "WEB-1"], RUNNER(repo));
  assert.equal(r.status, 0, r.out);
  const flipped = JSON.parse(read(repo, `${WEB1}/results.json`));
  flipped.criteria["review:vigil"].status = "FAIL";
  write(repo, `${WEB1}/results.json`, JSON.stringify(flipped, null, 2) + "\n");
  r = tool(repo, "review-run.ts", ["vigil", "WEB-1"], RUNNER(repo));
  assert.notEqual(r.status, 0);
  assert.match(r.out, /a PASS is final for its round/);
  write(
    repo,
    `${WEB1}/review-vigil.md`,
    read(repo, `${WEB1}/review-vigil.md`).replace(
      "- verdict: PASS",
      "- verdict: FAIL",
    ),
  );
  r = tool(repo, "review-run.ts", ["vigil", "WEB-1"], RUNNER(repo));
  assert.notEqual(r.status, 0);
  assert.match(
    r.out,
    /is not the review recorded in .*results\.json \(missing or edited\)/,
  );

  // contract:add changes the criteria: the PASS is stale, one run is allowed, the third still needs the operator.
  repo = startOneOff({ qa: "Q3" });
  buildAndProve(repo);
  write(repo, `${WEB1}/as-built.md`, AS_BUILT("WEB-1"));
  r = tool(repo, "review-run.ts", ["vigil", "WEB-1"], RUNNER(repo));
  assert.equal(r.status, 0, r.out);
  r = tool(repo, "contract.ts", [
    "add",
    "WEB-1",
    "C3",
    "--evidence",
    "check",
    "--statement",
    "The second check passes.",
    "--command",
    "yarn check:ok",
  ]);
  assert.equal(r.status, 0, r.out);
  assert.match(
    tool(repo, "status.ts", ["WEB-1"]).out,
    /review:vigil manual \(the criteria changed after this review/,
  );
  // The merge gate sees the same staleness: --strict fails the PASS.
  r = checkSpecs(repo);
  assert.notEqual(r.status, 0);
  assert.match(
    r.out,
    /review:vigil's PASS no longer holds: the criteria changed after this review/,
  );
  r = tool(repo, "contract.ts", ["run", "WEB-1"]);
  assert.equal(r.status, 0, r.out);
  r = tool(repo, "review-run.ts", ["vigil", "WEB-1"], RUNNER(repo));
  assert.equal(r.status, 0, r.out);
  assert.equal(resultsOf(repo).criteria["review:vigil"]!.runs, 2);
  r = tool(repo, "review-run.ts", ["vigil", "WEB-1"], RUNNER(repo));
  assert.notEqual(r.status, 0);
  assert.match(r.out, /a third run needs the operator's word/);
});

test("WEB-12 C3: the count and the criteria hash are read from the hash-bound review file, so an edit to results.json earns nothing", () => {
  // Two FAIL runs, then `runs` deleted by hand: the file still says run 2.
  let repo = startOneOff({ qa: "Q3" });
  buildAndProve(repo);
  write(repo, `${WEB1}/as-built.md`, AS_BUILT("WEB-1"));
  const failing = { ...RUNNER(repo), PEM_FIXTURE_VERDICT: "FAIL" };
  assert.notEqual(
    tool(repo, "review-run.ts", ["vigil", "WEB-1"], failing).status,
    0,
  );
  assert.notEqual(
    tool(repo, "review-run.ts", ["vigil", "WEB-1"], failing).status,
    0,
  );
  assert.equal(resultsOf(repo).criteria["review:vigil"]!.runs, 2);
  const edited = JSON.parse(read(repo, `${WEB1}/results.json`));
  delete edited.criteria["review:vigil"].runs;
  write(repo, `${WEB1}/results.json`, JSON.stringify(edited, null, 2) + "\n");
  let r = tool(repo, "review-run.ts", ["vigil", "WEB-1"], RUNNER(repo));
  assert.notEqual(r.status, 0);
  assert.match(r.out, /a third run needs the operator's word/);
  // `runs` set to 1 by hand: results.json disagrees with the file, refused as an edit.
  edited.criteria["review:vigil"].runs = 1;
  write(repo, `${WEB1}/results.json`, JSON.stringify(edited, null, 2) + "\n");
  r = tool(repo, "review-run.ts", ["vigil", "WEB-1"], RUNNER(repo));
  assert.notEqual(r.status, 0);
  assert.match(r.out, /results\.json is never edited/);

  // After a PASS, the run record's criteria hash changed by hand reopens nothing.
  repo = startOneOff({ qa: "Q3" });
  buildAndProve(repo);
  write(repo, `${WEB1}/as-built.md`, AS_BUILT("WEB-1"));
  r = tool(repo, "review-run.ts", ["vigil", "WEB-1"], RUNNER(repo));
  assert.equal(r.status, 0, r.out);
  const forged = JSON.parse(read(repo, `${WEB1}/results.json`));
  forged.criteria["review:vigil"].run.criteria_sha256 = "0".repeat(64);
  write(repo, `${WEB1}/results.json`, JSON.stringify(forged, null, 2) + "\n");
  r = tool(repo, "review-run.ts", ["vigil", "WEB-1"], RUNNER(repo));
  assert.notEqual(r.status, 0);
  assert.match(r.out, /results\.json is never edited/);
  assert.equal(resultsOf(repo).criteria["review:vigil"]!.status, "PASS");
});
