/**
 * Runs a reviewer in fresh context and records its verdict through tooling
 * (A7; A13.2, Vigil's B1 and S1). The builder never transcribes the judge.
 *
 *   yarn review:run <role> <id>      review one ticket; writes review-<role>.md
 *                                    and records review:<role> in results.json
 *   yarn review:run vigil <EPIC>     the Tickets gate: pre-flights every drafted
 *                                    ticket and writes tickets/_preflight.md
 *
 * The reviewer is `claude -p` with Read, Grep and Glob only: the generated
 * subagent when `.claude/agents/<role>.md` exists, otherwise the role file as
 * an appended system prompt. Its prompt is generated from the contract, the
 * results and the evidence index, never from the builder's words. The review
 * file carries the contract and as-built hashes it read; editing either
 * afterwards resets the review to FAIL in check-specs.
 *
 * What this proves: a review ran against that contract. It does not prove the
 * review was independent: the builder starts it and owns the tree it reads.
 * The boundary is Taylor reading review-<role>.md before merge.
 *
 * It needs the Anthropic API, which the sandbox's network allowlist does not
 * reach: run it unsandboxed (a permission prompt), or Taylor runs it.
 */

import { spawnSync } from "node:child_process";
import path from "node:path";

import { splitFrontmatter } from "./lib/docs.ts";
import {
  getCurrentBranch,
  getHead,
  listChangedAgainstBase,
  listDirty,
} from "./lib/git.ts";
import {
  asBuiltPath,
  branchFor,
  contractPath,
  fileExists,
  findItem,
  findRoleFile,
  formatResults,
  hashCriteria,
  hashFile,
  hashText,
  now,
  preflightPath,
  readContract,
  readItemState,
  readRepoText,
  readResults,
  readSpecsTree,
  refreshStatusFile,
  resultsPath,
  reviewPath,
  statusPath,
  writeRepoText,
  type Epic,
  type Item,
} from "./lib/specs.ts";
import { loadToolkit } from "./lib/toolkit.ts";

/** Set only by the contract-loop harness: a script that stands in for Claude. */
const FIXTURE_RUNNER_ENV = "PEM_REVIEW_RUNNER";
const TOOLS = "Read,Grep,Glob";
const TIMEOUT_MS = 20 * 60 * 1000;

const toolkit = loadToolkit();
const [role, target] = process.argv.slice(2);

function stop(message: string): never {
  console.error(`review:run — ${message}`);
  process.exit(1);
}

type Verdict = { text: string; model: string; runner: string; exit: number };

/** Runs the reviewer on a prompt; returns its raw final text. */
function runReviewer(prompt: string): Verdict {
  const fixture = process.env[FIXTURE_RUNNER_ENV];
  if (fixture) {
    const result = spawnSync(process.execPath, [fixture], {
      input: prompt,
      encoding: "utf8",
    });
    const parsed = JSON.parse(result.stdout || "{}") as {
      result?: string;
      model?: string;
    };
    return {
      text: parsed.result ?? "",
      model: parsed.model ?? "fixture",
      runner: `fixture: ${path.basename(fixture)}`,
      exit: result.status ?? 1,
    };
  }
  const args = [
    "-p",
    "--output-format",
    "json",
    "--no-session-persistence",
    "--permission-mode",
    "dontAsk",
    "--tools",
    TOOLS,
  ];
  let how: string;
  if (fileExists(`.claude/agents/${role}.md`)) {
    args.push("--agent", role!);
    how = `agent ${role}`;
  } else {
    const file = findRoleFile(role!)!;
    args.push(
      "--append-system-prompt",
      splitFrontmatter(readRepoText(file)).body,
    );
    how = `role ${file}`;
  }
  const version =
    spawnSync("claude", ["--version"], { encoding: "utf8" }).stdout?.trim() ??
    "unknown";
  const result = spawnSync("claude", args, {
    input: prompt,
    encoding: "utf8",
    timeout: TIMEOUT_MS,
    maxBuffer: 64 * 1024 * 1024,
  });
  let text = "";
  let model = "unknown";
  try {
    const parsed = JSON.parse(result.stdout) as {
      result?: string;
      is_error?: boolean;
      modelUsage?: Record<string, unknown>;
    };
    text = parsed.is_error ? "" : (parsed.result ?? "");
    model = Object.keys(parsed.modelUsage ?? {})[0] ?? model;
  } catch {
    text = "";
  }
  return {
    text,
    model,
    runner: `claude ${version} (${how}; tools ${TOOLS})`,
    exit: text ? (result.status ?? 1) : 1,
  };
}

const verdictOf = (text: string) =>
  [...text.matchAll(/^\s*VERDICT:\s*(PASS|FAIL)\s*$/gm)].at(-1)?.[1] ?? null;

const venue = (command: string) =>
  `Venue: Claude Code, headless, started by \`${command}\`. You have ${TOOLS.split(",").join(", ")} only: you cannot edit or run anything.`;

// ---------------------------------------------------------------- ticket review

function reviewTicket(item: Item) {
  const { results } = readResults(item);
  const file = readContract(item);
  const contract = file.contract;
  if (!results || !contract)
    stop(
      `${item.id} has not started, or its contract is invalid; run yarn check-specs`,
    );
  if (hashCriteria(contract.criteria) !== results.criteria_sha256)
    stop(
      `${contractPath(item)}: the criteria changed after init; restore them first`,
    );
  const criterionId = `review:${role}`;
  if (!contract.criteria.some((c) => c.id === criterionId))
    stop(
      `${item.id} has no ${criterionId} criterion; add it with yarn contract:add ${item.id} ${criterionId}`,
    );
  if (!fileExists(asBuiltPath(item)))
    stop(
      `write ${asBuiltPath(item)} first (from docs/engineering/templates/as-built.template.md): reviewers read it, and editing it later resets their verdicts`,
    );
  const state = readItemState(item, toolkit.specsRoot);
  const unproven = state.criteria.filter(
    (c) => !c.id.startsWith("review:") && c.status !== "PASS",
  );
  if (unproven.length)
    stop(
      `prove the other criteria first: ${unproven.map((c) => `${c.id} (${c.reason})`).join("; ")}`,
    );
  const branch = getCurrentBranch();
  if (branch !== branchFor(toolkit, item.id))
    stop(
      `review ${item.id} on its branch. Run: git switch ${branchFor(toolkit, item.id)}`,
    );
  const dirty = listDirty().filter(
    (f) => !f.startsWith(`${item.dir}/`) && f !== statusPath(toolkit.specsRoot),
  );
  if (dirty.length)
    stop(
      `commit the code first, so the review binds a commit: ${dirty.slice(0, 5).join(", ")}`,
    );

  const command = `yarn review:run ${role} ${item.id}`;
  const changed = listChangedAgainstBase();
  const evidence = contract.criteria
    .filter((c) => !c.id.startsWith("review:"))
    .map((c) => {
      const run = results.criteria[c.id]?.run;
      return `   - ${c.id} ${c.evidence}: ${run ? `${run.evidence_path} (sha256 ${run.evidence_sha256.slice(0, 12)})` : "no run"}`;
    });
  const surfaces = contract.cites.filter((c) => c.includes("/"));
  const prompt = [
    venue(command),
    "",
    `You are ${role}, reviewing ticket ${item.id} in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.`,
    "",
    "Read, in this order:",
    `1. The contract: ${contractPath(item)}. Its criteria, non-negotiables, planned paths and out of scope are what was promised.`,
    `2. The results: ${resultsPath(item)}. Each criterion's run record and evidence file.`,
    `3. The as-built: ${asBuiltPath(item)}. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.`,
    "4. The evidence:",
    ...evidence,
    `5. The files this branch changes against main: ${changed ? changed.join(", ") || "none" : "unknown (no main branch)"}.`,
    ...(surfaces.length
      ? [
          `6. The surface the ticket cites: ${surfaces.join(", ")}. Every state and criterion it names.`,
        ]
      : []),
    "",
    "For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.",
    "",
    "Your last line must be exactly one of:",
    "VERDICT: PASS",
    "VERDICT: FAIL",
  ].join("\n");

  const contractHash = hashText(file.text);
  const asBuiltHash = hashFile(asBuiltPath(item));
  const head = getHead()!;
  const at = now();
  console.log(
    `review:run — ${role} is reviewing ${item.id}; this takes minutes.`,
  );
  const review = runReviewer(prompt);
  const verdict = review.exit === 0 ? verdictOf(review.text) : null;
  const rel = reviewPath(item, role!);
  writeRepoText(
    rel,
    [
      `# Review — ${role} on ${item.id}`,
      "",
      `> Written by \`${command}\`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.`,
      "",
      `- contract_sha256: ${contractHash}`,
      `- as_built_sha256: ${asBuiltHash}`,
      `- head: ${head}`,
      `- runner: ${review.runner}`,
      `- model: ${review.model}`,
      `- at: ${at}`,
      `- verdict: ${verdict ?? "none (the reviewer did not finish with a VERDICT line)"}`,
      "",
      "## Prompt",
      "",
      prompt,
      "",
      "## Review",
      "",
      review.text || "(no output)",
      "",
    ].join("\n"),
  );
  results.criteria[criterionId] = {
    status: verdict === "PASS" ? "PASS" : "FAIL",
    evidence: "manual",
    run: {
      command,
      exit: review.exit,
      at,
      head,
      evidence_path: rel,
      evidence_sha256: hashFile(rel),
      contract_sha256: contractHash,
      as_built_sha256: asBuiltHash,
      runner: review.runner,
    },
  };
  results.updated_at = now();
  writeRepoText(resultsPath(item), formatResults(results));
  refreshStatusFile(toolkit);
  if (!verdict)
    stop(
      `${role} gave no verdict (${review.exit === 0 ? "no VERDICT line" : "the run failed; from the sandbox, re-run unsandboxed, or Taylor runs: " + command}). ${criterionId} stays FAIL; see ${rel}`,
    );
  console.log(
    `review:run — ${criterionId} ${verdict}. Read ${rel} before merge.`,
  );
  if (verdict !== "PASS") process.exit(1);
}

// ---------------------------------------------------------------- pre-flight

function preflight(epic: Epic, items: Item[]) {
  const drafts = items.filter(
    (i) => i.epic?.prefix === epic.prefix && !fileExists(resultsPath(i)),
  );
  if (drafts.length === 0)
    stop(
      `${epic.prefix} has no drafted tickets; draft them with yarn contract:init ${epic.prefix} <slug> --draft`,
    );
  const command = `yarn review:run vigil ${epic.prefix}`;
  const hashes = new Map(
    drafts.map((i) => [i.id, hashText(readRepoText(contractPath(i)))]),
  );
  const prompt = [
    venue(command),
    "",
    `You are vigil, running the Tickets gate's pre-flight for epic ${epic.prefix} in fresh context. Judge only from the files.`,
    "",
    `Read the brief (${epic.dir}/brief.md), the approved UX proposals under ${epic.dir}/ux/, ${epic.dir}/technical.md if it exists, and each drafted contract:`,
    ...drafts.map((i) => `- ${i.id}: ${contractPath(i)}`),
    "",
    "For each contract, check: every criterion is testable and names the right evidence type; it cites one surface and the criterion IDs it builds; every state and unhappy path of that surface is covered by this or another ticket; planned paths and depends_on are plausible; nothing is out of the epic's appetite.",
    "",
    "Write one line per ticket, exactly in this form, then your findings:",
    ...drafts.map((i) => `${i.id}: PASS or FAIL, with the reason`),
    "",
    "Your last line must be exactly one of:",
    "VERDICT: PASS",
    "VERDICT: FAIL",
  ].join("\n");
  console.log(
    `review:run — vigil is pre-flighting ${drafts.length} ticket(s) of ${epic.prefix}; this takes minutes.`,
  );
  const review = runReviewer(prompt);
  const lines = drafts.map((i) => {
    const said =
      review.exit === 0
        ? review.text.match(
            new RegExp(`^\\W*${i.id}\\W*:?\\s*\\**\\s*(PASS|FAIL)`, "m"),
          )?.[1]
        : null;
    return `- ${i.id}: ${said ?? "FAIL"} (contract ${hashes.get(i.id)!.slice(0, 12)})`;
  });
  const rel = preflightPath(epic);
  writeRepoText(
    rel,
    [
      `# Pre-flight — ${epic.prefix}`,
      "",
      `> Written by \`${command}\` (the Tickets gate). Never edit it: \`contract:init\` starts a ticket only on its PASS line, and only while the contract's hash still matches.`,
      "",
      `- head: ${getHead()}`,
      `- runner: ${review.runner}`,
      `- model: ${review.model}`,
      `- at: ${now()}`,
      "",
      "## Verdicts",
      "",
      ...lines,
      "",
      "## Prompt",
      "",
      prompt,
      "",
      "## Review",
      "",
      review.text || "(no output)",
      "",
    ].join("\n"),
  );
  console.log(`review:run — wrote ${rel}:\n  ${lines.join("\n  ")}`);
  if (lines.some((line) => line.includes(": FAIL"))) process.exit(1);
}

// ---------------------------------------------------------------- main

if (!role || !target) stop("usage: yarn review:run <role> <id | EPIC>");
if (!/^[a-z]+$/.test(role))
  stop(`"${role}" is not a role name; use the lower-case name, as in vigil`);
if (!findRoleFile(role)) stop(`no role file for ${role} under docs/roles/`);
const tree = readSpecsTree(toolkit);
const epic = tree.epics.find((e) => e.prefix === target);
if (epic) {
  if (role !== "vigil")
    stop(
      "the Tickets gate's pre-flight is Vigil's; run yarn review:run vigil " +
        target,
    );
  preflight(epic, tree.items);
} else {
  const item = findItem(tree, target);
  if (!item) stop(`no ticket or epic ${target} under ${toolkit.specsRoot}/`);
  reviewTicket(item);
}
