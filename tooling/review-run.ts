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
 * results and the evidence index, never from the builder's words; it scopes the
 * reviewer to the planned-path changes, one import hop out only to confirm a
 * Blocking, and says this is the only pass unless it FAILs (C3). The review
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
import { getHead, listChangedAgainstBase, listDirty } from "./lib/git.ts";
import {
  asBuiltPath,
  contractPath,
  fileExists,
  findItem,
  findRoleFile,
  formatResults,
  hashCriteria,
  hashFile,
  hashText,
  inPlannedPaths,
  now,
  pickCost,
  preflightPath,
  readContract,
  readItemState,
  readRepoText,
  readResults,
  readSpecsTree,
  refreshStatusFile,
  resultsPath,
  reviewPath,
  writeRepoText,
  type Cost,
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

type Verdict = {
  text: string;
  model: string;
  runner: string;
  exit: number;
  /** Why the reviewer produced no review, when it did not. */
  error: string | null;
  /** What the run cost: the headless result's usage, when it printed one, and the seconds it took. */
  cost: Partial<Cost>;
};

/** The headless result's usage, as `claude -p --output-format json` prints it. */
type HeadlessResult = {
  result?: string;
  is_error?: boolean;
  model?: string;
  usage?: {
    input_tokens?: number;
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
    output_tokens?: number;
  };
  modelUsage?: Record<
    string,
    {
      inputTokens?: number;
      cacheReadInputTokens?: number;
      cacheCreationInputTokens?: number;
      outputTokens?: number;
    }
  >;
};

/**
 * The cost fields of a run (O4): `usage` when the result carries it, else the
 * sum over `modelUsage`; the seconds are review:run's own wall clock, so a run
 * that printed no JSON still records how long it took.
 */
function costOf(parsed: HeadlessResult, seconds: number): Partial<Cost> {
  const u = parsed.usage;
  if (u)
    return {
      tokens_input: u.input_tokens ?? 0,
      tokens_cache_read: u.cache_read_input_tokens ?? 0,
      tokens_cache_write: u.cache_creation_input_tokens ?? 0,
      tokens_output: u.output_tokens ?? 0,
      seconds,
    };
  const models = Object.values(parsed.modelUsage ?? {});
  if (models.length === 0) return { seconds };
  const sum = (pick: (m: (typeof models)[number]) => number | undefined) =>
    models.reduce((total, m) => total + (pick(m) ?? 0), 0);
  return {
    tokens_input: sum((m) => m.inputTokens),
    tokens_cache_read: sum((m) => m.cacheReadInputTokens),
    tokens_cache_write: sum((m) => m.cacheCreationInputTokens),
    tokens_output: sum((m) => m.outputTokens),
    seconds,
  };
}

const secondsSince = (started: number) =>
  Math.round((Date.now() - started) / 100) / 10;

/** The header lines a review or pre-flight file carries for the run's cost. */
const costLines = (cost: Partial<Cost>) =>
  Object.entries(pickCost(cost)).map(
    ([field, value]) => `- ${field}: ${value}`,
  );

/** Runs the reviewer on a prompt; returns its raw final text. */
function runReviewer(prompt: string): Verdict {
  const fixture = process.env[FIXTURE_RUNNER_ENV];
  if (fixture) {
    const started = Date.now();
    const result = spawnSync(process.execPath, [fixture], {
      input: prompt,
      encoding: "utf8",
    });
    const seconds = secondsSince(started);
    const parsed = JSON.parse(result.stdout || "{}") as HeadlessResult;
    return {
      text: parsed.result ?? "",
      model: parsed.model ?? "fixture",
      runner: `fixture: ${path.basename(fixture)}`,
      exit: result.status ?? 1,
      error: parsed.result ? null : "the fixture runner printed no result",
      cost: costOf(parsed, seconds),
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
  const started = Date.now();
  const result = spawnSync("claude", args, {
    input: prompt,
    encoding: "utf8",
    timeout: TIMEOUT_MS,
    maxBuffer: 64 * 1024 * 1024,
    // The reviewer is read-only: the stop gate has nothing of its to check,
    // and blocking its stop replaces the review with a reply to the hook.
    env: { ...process.env, PEM_HEADLESS_REVIEW: "1" },
  });
  const seconds = secondsSince(started);
  let text = "";
  let model = "unknown";
  let error: string | null = null;
  let cost: Partial<Cost> = { seconds };
  try {
    const parsed = JSON.parse(result.stdout) as HeadlessResult;
    if (parsed.is_error) error = parsed.result ?? "the run reported an error";
    else text = parsed.result ?? "";
    model = Object.keys(parsed.modelUsage ?? {})[0] ?? model;
    cost = costOf(parsed, seconds);
  } catch {
    error =
      result.error?.message ??
      (result.stderr?.trim().split("\n").at(-1) || "no JSON on stdout");
  }
  return {
    text,
    model,
    runner: `claude ${version} (${how}; tools ${TOOLS})`,
    exit: text ? (result.status ?? 1) : 1,
    error: text ? null : (error ?? "no output"),
    cost,
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
  const criterionId = `review:${role}`;
  // A guard that stops the review leaves its time and reason under the
  // criterion (Y5: attempts that stopped at once were never explained).
  const refuse = (reason: string): never => {
    const result = results.criteria[criterionId];
    if (result) {
      (result.refused ??= []).push({ at: now(), reason });
      results.updated_at = now();
      writeRepoText(resultsPath(item), formatResults(results));
    }
    stop(reason);
  };
  if (hashCriteria(contract.criteria) !== results.criteria_sha256)
    refuse(
      `${contractPath(item)}: the criteria changed after init; restore them first`,
    );
  if (!contract.criteria.some((c) => c.id === criterionId))
    stop(
      `${item.id} has no ${criterionId} criterion; add it with yarn contract:add ${item.id} ${criterionId}`,
    );
  if (!fileExists(asBuiltPath(item)))
    refuse(
      `write ${asBuiltPath(item)} first (from docs/engineering/templates/as-built.template.md): reviewers read it, and editing it later resets their verdicts`,
    );
  const state = readItemState(item, toolkit.specsRoot);
  const unproven = state.criteria.filter(
    (c) => !c.id.startsWith("review:") && c.status !== "PASS",
  );
  if (unproven.length)
    refuse(
      `prove the other criteria first: ${unproven.map((c) => `${c.id} (${c.reason})`).join("; ")}`,
    );
  // Other tickets' uncommitted files are theirs: the branch is shared (PR-14).
  const dirty = listDirty().filter((f) =>
    inPlannedPaths(f, contract.planned_paths),
  );
  if (dirty.length)
    refuse(
      `commit the code first, so the review binds a commit: ${dirty.slice(0, 5).join(", ")}`,
    );

  const command = `yarn review:run ${role} ${item.id}`;
  const changed = listChangedAgainstBase()?.filter((f) =>
    inPlannedPaths(f, contract.planned_paths),
  );
  const evidence = contract.criteria
    .filter((c) => !c.id.startsWith("review:"))
    .map((c) => {
      const run = results.criteria[c.id]?.run;
      return `   - ${c.id} ${c.evidence}: ${run ? `${run.evidence_path} (sha256 ${run.evidence_sha256.slice(0, 12)})` : "no run"}`;
    });
  const surfaces = contract.cites.filter((c) => c.includes("/"));
  const citedIds = contract.cites.filter((c) => !c.includes("/"));
  const prompt = [
    venue(command),
    "",
    `You are ${role}, reviewing ticket ${item.id} in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.`,
    "",
    "This is the only review pass unless you FAIL it, so list every finding now. A PASS is final for its round: Should-fix and Consider findings become follow-ups the builder fixes without reopening the review, and nothing you hold back is asked for later. Only a Blocking finding earns a second pass.",
    "",
    "Read, in this order:",
    `1. The contract: ${contractPath(item)}. Its criteria, non-negotiables, planned paths and out of scope are what was promised, and what you judge the changes against.`,
    `2. The results: ${resultsPath(item)}. Each criterion's run record and evidence file.`,
    `3. The as-built: ${asBuiltPath(item)}. What the builder says shipped, and every deviation. It is a claim to check inside the changed files, not an invitation to read the repo.`,
    "4. The evidence:",
    ...evidence,
    `5. The changed files, this ticket's planned paths against main (other tickets share the branch): ${changed ? changed.join(", ") || "none" : "unknown (no main branch)"}. Judge these changes against the criteria and the non-negotiables.`,
    ...(surfaces.length
      ? [
          `6. The surface the ticket cites: ${surfaces.join(", ")}. Read only the parts the contract names (${citedIds.join(", ") || "the states its criteria name"}), not the whole file.`,
        ]
      : []),
    "",
    "Stay inside the changed files. Follow an import one hop out of a changed file only to confirm a Blocking finding, never to look for one, and never further than that hop.",
    "",
    "For each criterion, say whether the evidence and the changed code show it is met. Then list every finding, graded Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL; a Should-fix or Consider finding never does.",
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
      ...costLines(review.cost),
      `- verdict: ${verdict ?? "none (the reviewer did not finish with a VERDICT line)"}`,
      "",
      "## Prompt",
      "",
      prompt,
      "",
      "## Review",
      "",
      review.text || `(no review: ${review.error})`,
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
      ...pickCost(review.cost),
    },
    ...(results.criteria[criterionId]?.refused?.length && {
      refused: results.criteria[criterionId]!.refused,
    }),
  };
  results.updated_at = now();
  writeRepoText(resultsPath(item), formatResults(results));
  refreshStatusFile(toolkit);
  if (!verdict)
    stop(
      `${role} gave no verdict (${review.error ? `the run failed: ${review.error}; from the sandbox, re-run unsandboxed, or Taylor runs: ${command}` : "no VERDICT line"}). ${criterionId} stays FAIL; see ${rel}`,
    );
  console.log(
    `review:run — ${criterionId} ${verdict}. Read ${rel} before merge.`,
  );
  if (verdict !== "PASS") process.exit(1);
}

// ---------------------------------------------------------------- pre-flight

/** The pre-flight file's `- refused:` lines, kept across runs: a completed run never clears them. */
const refusalLines = (text: string | null) =>
  text?.split("\n").filter((line) => line.startsWith("- refused: ")) ?? [];

const preflightNote = (command: string) =>
  `> Written by \`${command}\` (the Tickets gate). Never edit it: \`contract:init\` starts a ticket only on its PASS line, and only while the contract's hash still matches.`;

/**
 * A guard that stops the pre-flight leaves one line in the file's header (Y5),
 * after the header's last line when the file exists, else in a header of its own.
 */
function refusePreflight(epic: Epic, command: string, reason: string): never {
  const rel = preflightPath(epic);
  const line = `- refused: ${now()}: ${reason}`;
  const existing = fileExists(rel) ? readRepoText(rel) : null;
  let text: string;
  if (existing) {
    const lines = existing.split("\n");
    let at = lines.findIndex((l) => l.startsWith("## "));
    if (at === -1) at = lines.length;
    while (at > 0 && lines[at - 1]!.trim() === "") at--;
    lines.splice(at, 0, line);
    text = lines.join("\n");
  } else
    text = [
      `# Pre-flight — ${epic.prefix}`,
      "",
      preflightNote(command),
      "",
      line,
      "",
    ].join("\n");
  writeRepoText(rel, text);
  stop(reason);
}

function preflight(epic: Epic, items: Item[]) {
  const command = `yarn review:run vigil ${epic.prefix}`;
  const drafts = items.filter(
    (i) => i.epic?.prefix === epic.prefix && !fileExists(resultsPath(i)),
  );
  if (drafts.length === 0)
    refusePreflight(
      epic,
      command,
      `${epic.prefix} has no drafted tickets; draft them with yarn contract:init ${epic.prefix} <slug> --draft`,
    );
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
  const refused = refusalLines(fileExists(rel) ? readRepoText(rel) : null);
  writeRepoText(
    rel,
    [
      `# Pre-flight — ${epic.prefix}`,
      "",
      preflightNote(command),
      "",
      `- head: ${getHead()}`,
      `- runner: ${review.runner}`,
      `- model: ${review.model}`,
      `- at: ${now()}`,
      ...costLines(review.cost),
      ...refused,
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
      review.text || `(no review: ${review.error})`,
      "",
    ].join("\n"),
  );
  console.log(`review:run — wrote ${rel}:\n  ${lines.join("\n  ")}`);
  if (review.error)
    stop(
      `vigil did not run (${review.error}). Every line is FAIL until it does. From the sandbox, re-run unsandboxed, or Taylor runs: ${command}`,
    );
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
