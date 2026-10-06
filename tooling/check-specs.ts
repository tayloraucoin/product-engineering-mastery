/**
 * Checks the specs tree (E-25; A4 to A11, A13.2): layout and ids, contracts,
 * results and their run records, closure, immutability against main, the
 * spec-file caps, and drift of the generated _status.md.
 *
 *   yarn check-specs                 fixtures first, then the repo's tree
 *   yarn check-specs --root <dir>    one specs tree with git off (fixture authoring)
 *   yarn check-specs --skip-fixtures the live tree only (the contract-loop harness)
 *   yarn check-specs --strict        what is left is a failure: the check before a merge
 *
 * Without --strict, work still in flight only warns (PR-15): a stale PASS, a
 * ticket closing with criteria left, _status.md out of date. Tickets share the
 * operator's branch, so one ticket's open close never fails another's verify.
 *
 * Archived items (specs/<app>/_archive/<YYYY>/<MM>/) are read like any other,
 * so their ids stay taken; their contracts are checked as records, and they
 * must be closed.
 *
 * Fails on: a layout or id problem; a contract that breaks its schema or its
 * rules; results that do not match the contract or its frozen criteria; a
 * PASS without a valid run record (always), or one the code has outrun (once
 * an as-built exists); an as-built missing a section, or present while any
 * criterion is not PASS; a merged record edited; a spec file over its cap;
 * _status.md out of date. Warns on A8's promotion and truth-file gaps, and on
 * a stale PASS while the ticket is still open.
 */

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";

import {
  estimateTokens,
  listFiles,
  REPO_ROOT,
  splitFrontmatter,
} from "./lib/docs.ts";
import { getBaseRef, readOnRef } from "./lib/git.ts";
import {
  AS_BUILT_SECTIONS,
  asBuiltPath,
  checkContract,
  contractPath,
  disableGit,
  enableGit,
  fileExists,
  hashCriteria,
  isEmptySection,
  isReview,
  parseAsBuilt,
  readContract,
  readItemState,
  readRepoText,
  readResults,
  readSpecsTree,
  renderStatusFile,
  resultsPath,
  SPEC_FILE_CAPS,
  statusPath,
  suggestReviewers,
  withoutApplied,
  type SpecsTree,
} from "./lib/specs.ts";
import { loadToolkit, type Toolkit } from "./lib/toolkit.ts";

const FIXTURES = "tooling/fixtures/specs";

type Report = { errors: string[]; warnings: string[] };

/** Fixtures and the pre-merge check judge the finished state; a build in flight does not. */
let strict = process.argv.includes("--strict");

const listIfDir = (rel: string) => {
  try {
    return readdirSync(path.join(REPO_ROOT, rel));
  } catch {
    return [];
  }
};

function checkItems(tree: SpecsTree, toolkit: Toolkit, report: Report) {
  const base = getBaseRef();
  for (const item of tree.items) {
    const file = readContract(item);
    const { results, problems: resultProblems } = readResults(item);
    const hasAsBuilt = fileExists(asBuiltPath(item));
    const asBuilt = hasAsBuilt
      ? parseAsBuilt(readRepoText(asBuiltPath(item)))
      : null;
    const testChanges = asBuilt
      ? !isEmptySection(asBuilt.sections.get("Test changes"))
      : false;

    report.errors.push(
      ...checkContract(item, file, toolkit, {
        started: results !== null,
        testChanges,
        specsRoot: tree.specsRoot,
      }),
    );
    report.errors.push(...resultProblems);
    const contract = file.contract;

    if (!results) {
      if (hasAsBuilt)
        report.errors.push(
          `${asBuiltPath(item)} exists, but ${item.id} never started; run yarn contract:init first`,
        );
      continue;
    }
    if (!contract) continue;

    // Results match the contract, and the criteria are still the frozen set (A13.2).
    const rel = resultsPath(item);
    if (results.id !== item.id)
      report.errors.push(
        `${rel}: id is ${results.id}, but the folder is ${item.id}`,
      );
    const contractIds = new Set(contract.criteria.map((c) => c.id));
    for (const id of Object.keys(results.criteria))
      if (!contractIds.has(id))
        report.errors.push(
          `${rel} holds ${id}, which the contract no longer has; a criterion is never removed after init. Restore it in ${contractPath(item)}`,
        );
    for (const criterion of contract.criteria) {
      const result = results.criteria[criterion.id];
      if (!result)
        report.errors.push(
          `${rel} has no ${criterion.id}; criteria are added only with yarn contract:add ${item.id} ${criterion.id}`,
        );
      else if (result.evidence !== criterion.evidence)
        report.errors.push(
          `${rel}: ${criterion.id} is recorded as ${result.evidence}, but the contract says ${criterion.evidence}`,
        );
    }
    if (hashCriteria(contract.criteria) !== results.criteria_sha256)
      report.errors.push(
        `${contractPath(item)}: the criteria changed after init (A13.2). Restore them; add one only with yarn contract:add ${item.id}`,
      );

    // Every PASS still holds (A9, B1, B2).
    // Staleness is the pre-merge check's question, and only of Q3 (PR-19).
    const state = readItemState(item, tree.specsRoot, { staleness: strict });
    for (const c of state.criteria) {
      if (c.tampered)
        report.errors.push(
          `${rel}: ${c.id} is PASS, but ${c.reason}. Re-record it: ${recordCommand(c.id, c.evidence, item.id)}`,
        );
      else if (c.stale)
        (hasAsBuilt && strict ? report.errors : report.warnings).push(
          `${rel}: ${c.id}'s PASS no longer holds: ${c.reason}. Re-record it: ${recordCommand(c.id, c.evidence, item.id)}`,
        );
    }

    // Closure: the as-built lands, and everything it closes is proven (ruling (b)).
    if (asBuilt) {
      const at = asBuiltPath(item);
      for (const section of AS_BUILT_SECTIONS)
        if (!asBuilt.sections.has(section))
          report.errors.push(
            `${at} is missing the "## ${section}" section; copy it from docs/engineering/templates/as-built.template.md`,
          );
      if (
        asBuilt.sections.has("Migrations") &&
        (!asBuilt.applied ||
          !/^(n\/a|pending|\d{4}-\d{2}-\d{2})$/.test(asBuilt.applied))
      )
        report.errors.push(
          `${at}: Migrations needs "applied: n/a", "applied: pending" or "applied: <YYYY-MM-DD>"`,
        );
      if (/\[FILL/.test(asBuilt.text))
        report.errors.push(`${at} still holds [FILL] markers`);
      const notVerified = asBuilt.sections.get("Not verified") ?? "";
      for (const criterion of contract.criteria)
        if (
          criterion.evidence === "manual" &&
          !isReview(criterion) &&
          !notVerified.includes(criterion.id)
        )
          report.errors.push(
            `${at}: Not verified must name ${criterion.id}, a manual criterion (ruling (h))`,
          );
      const left = state.criteria.filter(
        (c) => c.status !== "PASS" && !c.tampered && !c.stale,
      );
      if (left.length)
        (strict ? report.errors : report.warnings).push(
          `${item.id} has an as-built, so it is closing, but ${left.map((c) => `${c.id} (${c.reason})`).join(", ")} ${left.length === 1 ? "is" : "are"} not PASS. ${left.some((c) => c.id.startsWith("review:")) ? `Run: yarn review:run ${left.find((c) => c.id.startsWith("review:"))!.id.slice(7)} ${item.id}` : `Run: yarn status ${item.id}`}`,
        );
    }

    // A8: a one-off whose planned paths reach UI while its truth_files are none.
    if (item.kind === "one-off" && !Array.isArray(contract.truth_files)) {
      const reach = suggestReviewers(contract, toolkit);
      if (reach.has("assay"))
        report.warnings.push(
          `${contractPath(item)}: planned paths reach UI, and truth_files is "${contract.truth_files}"; if behavior changes, name the living UX file (A8)`,
        );
    }

    // The archive holds closed work only (yarn specs:archive).
    if (item.archived && state.stage !== "closed")
      report.errors.push(
        `${item.id} is archived at ${item.dir}/ but is ${state.stage}; only closed work is archived. Move it back to ${item.origin}/`,
      );

    // Merged records are immutable, except an as-built's applied: value (E-24).
    // An archived record is compared with the file merged where it was filed.
    const onBase = (record: string) =>
      readOnRef(base!, record) ?? readOnRef(base!, relocateBack(item, record));
    if (base && state.merged) {
      for (const record of [
        contractPath(item),
        rel,
        ...listIfDir(item.dir)
          .filter((n) => n.startsWith("review-"))
          .map((n) => `${item.dir}/${n}`),
      ]) {
        const merged = onBase(record);
        if (
          merged !== null &&
          fileExists(record) &&
          readRepoText(record) !== merged
        )
          report.errors.push(
            `${record} is merged and immutable; git restore it. A new result belongs to a new item`,
          );
      }
      const mergedAsBuilt = onBase(asBuiltPath(item))!;
      if (
        withoutApplied(readRepoText(asBuiltPath(item))) !==
        withoutApplied(mergedAsBuilt)
      )
        report.errors.push(
          `${asBuiltPath(item)} is merged and immutable except its applied: value; git restore it, then change only that line`,
        );
    }
  }
}

/** A path in an archived item's folder, at the folder it was filed at. */
const relocateBack = (item: SpecsTree["items"][number], rel: string) =>
  rel.startsWith(`${item.dir}/`)
    ? `${item.origin}/${rel.slice(item.dir.length + 1)}`
    : rel;

function recordCommand(id: string, evidence: string, itemId: string) {
  if (id.startsWith("review:"))
    return `yarn review:run ${id.slice(7)} ${itemId}`;
  if (evidence === "test" || evidence === "check")
    return `yarn contract:run ${itemId} ${id}`;
  return `yarn contract:record ${itemId} ${id} --evidence <path>`;
}

/** UX truth and proposals: caps (A10), proposal frontmatter (A8), promotion and freezing. */
function checkUx(tree: SpecsTree, report: Report) {
  const base = getBaseRef();
  const all = fileExists(tree.specsRoot) ? listFiles(tree.specsRoot) : [];
  for (const file of all.filter(
    (f) => /\/ux\/.+\.md$/.test(f) || /\/technical\.md$/.test(f),
  )) {
    const text = readRepoText(file);
    const tokens = estimateTokens(text);
    const kind = file.endsWith("/technical.md")
      ? "technical"
      : path.posix.basename(file) === "overview.md"
        ? "overview"
        : "surface";
    if (tokens > SPEC_FILE_CAPS[kind])
      report.errors.push(
        `${file} is about ${tokens} tokens, over the ${SPEC_FILE_CAPS[kind]} cap for a ${kind} file (A10); split it${kind === "technical" ? " into technical/" : ""}`,
      );
  }
  for (const epic of tree.epics) {
    const proposals = all.filter(
      (f) => f.startsWith(`${epic.dir}/ux/`) && f.endsWith(".md"),
    );
    for (const file of proposals) {
      const raw = splitFrontmatter(readRepoText(file)).raw;
      const fm = (raw ? YAML.parse(raw) : null) as Record<
        string,
        unknown
      > | null;
      const expected = `${tree.specsRoot}/${epic.app}/ux/${file.slice(`${epic.dir}/ux/`.length)}`;
      if (!fm || fm.target !== expected)
        report.errors.push(
          `${file}: a proposal's frontmatter carries target: ${expected}, mirroring the truth path (A8)`,
        );
      if (!fm || !["draft", "approved"].includes(String(fm.status)))
        report.errors.push(`${file}: status is draft or approved (A8)`);
      if (!fm || !("promoted" in fm))
        report.errors.push(
          `${file}: carries promoted:, empty until yarn truth:promote ${epic.prefix} stamps it (A8)`,
        );
      const promoted = fm?.promoted;
      if (promoted && base) {
        const merged = readOnRef(base, file);
        if (
          merged !== null &&
          merged.includes(`promoted: ${String(promoted)}`) &&
          merged !== readRepoText(file)
        )
          report.errors.push(
            `${file} was promoted and merged, so it is frozen; git restore it and change the truth file instead`,
          );
      }
      if (!promoted && fm?.status === "approved") {
        const citing = tree.items.filter(
          (i) =>
            readContract(i).contract?.cites.includes(expected) ||
            readContract(i).contract?.cites.includes(file),
        );
        if (
          citing.length > 0 &&
          citing.every((i) =>
            ["closed", "migration pending"].includes(
              readItemState(i, tree.specsRoot).stage,
            ),
          )
        )
          report.warnings.push(
            `${file}: every ticket citing it has closed and it is not promoted; run yarn truth:promote ${epic.prefix}`,
          );
      }
    }
    // A11: no research in a build or ticket kickoff prompt.
    for (const prompt of all.filter((f) =>
      f.startsWith(`${epic.dir}/prompts/`),
    ))
      if (
        /(build|kickoff|tickets)|[A-Z][A-Z0-9]{1,4}-\d+/.test(
          path.posix.basename(prompt),
        ) &&
        readRepoText(prompt).includes("docs/research/")
      )
        report.errors.push(
          `${prompt} names a docs/research/ path; research is never attached to a build thread (A11)`,
        );
  }
}

function checkTree(
  toolkit: Toolkit,
  specsRoot: string,
  options: { status: boolean },
): Report {
  const report: Report = { errors: [], warnings: [] };
  const tree = readSpecsTree(toolkit, specsRoot);
  report.errors.push(...tree.problems);
  checkItems(tree, toolkit, report);
  checkUx(tree, report);
  if (options.status && (tree.items.length > 0 || tree.epics.length > 0)) {
    const rel = statusPath(specsRoot);
    if (!fileExists(rel) || readRepoText(rel) !== renderStatusFile(tree))
      (strict ? report.errors : report.warnings).push(
        `${rel} is out of date; run yarn status and commit it`,
      );
  }
  return report;
}

/** Each fixture: tooling/fixtures/specs/<case>/{case.json, specs/}. case.json: { expect, message?, status? }. */
function runFixtures(toolkit: Toolkit): string[] {
  const failures: string[] = [];
  const cases = listIfDir(FIXTURES).filter((name) =>
    fileExists(`${FIXTURES}/${name}/case.json`),
  );
  for (const name of cases) {
    const fixture = JSON.parse(
      readFileSync(path.join(REPO_ROOT, FIXTURES, name, "case.json"), "utf8"),
    ) as {
      expect: "pass" | "fail";
      message?: string;
      status?: boolean;
    };
    const report = checkTree(toolkit, `${FIXTURES}/${name}/specs`, {
      status: fixture.status ?? false,
    });
    const failed = report.errors.length > 0;
    if (failed !== (fixture.expect === "fail"))
      failures.push(
        `${name}: expected ${fixture.expect}, got ${failed ? `fail (${report.errors[0]})` : "pass"}`,
      );
    else if (
      fixture.message &&
      !report.errors.some((e) => e.includes(fixture.message!))
    )
      failures.push(
        `${name}: no error mentions "${fixture.message}"; got: ${report.errors.join(" | ")}`,
      );
  }
  if (cases.length === 0) failures.push(`no fixtures in ${FIXTURES}`);
  return failures.length ? failures : [String(cases.length)];
}

const toolkit = loadToolkit();
const rootFlag = process.argv.indexOf("--root");
if (rootFlag !== -1) {
  strict = true;
  disableGit();
  const report = checkTree(toolkit, process.argv[rootFlag + 1]!, {
    status: true,
  });
  console.log(
    [
      ...report.errors.map((e) => `error  ${e}`),
      ...report.warnings.map((w) => `warn   ${w}`),
    ].join("\n") || "clean",
  );
  process.exit(report.errors.length ? 1 : 0);
}

// The contract-loop harness copies no fixtures into its scratch repo.
// Fixtures are always judged strictly: they pin the finished state.
const strictRun = strict;
strict = true;
disableGit();
const fixtureResult = process.argv.includes("--skip-fixtures")
  ? ["0"]
  : runFixtures(toolkit);
if (fixtureResult.length > 1 || !/^\d+$/.test(fixtureResult[0]!)) {
  console.error(
    `check-specs — fixtures misbehaved:\n  ${fixtureResult.join("\n  ")}`,
  );
  process.exit(1);
}

// The live tree reads git again: staleness, merged records.
strict = strictRun;
enableGit();
const report = checkTree(toolkit, toolkit.specsRoot, { status: true });
for (const warning of report.warnings) console.log(`warn  ${warning}`);
if (report.errors.length > 0) {
  console.error(
    `check-specs — ${report.errors.length} problem(s):\n  ${report.errors.join("\n  ")}`,
  );
  process.exit(1);
}
console.log(
  `check-specs — ${fixtureResult[0]} fixtures behaved; ${toolkit.specsRoot}/ is clean.`,
);
