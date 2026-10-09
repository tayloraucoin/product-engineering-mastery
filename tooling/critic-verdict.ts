/**
 * critic-verdict (DEMO-16): the gate critic CI ends on. It reads the
 * tk-ui-critic reviews under a captures folder and exits 1 unless every one
 * passes.
 *
 *   node tooling/critic-verdict.ts <dir> [--surfaces <id,id,...>]
 *   node tooling/critic-verdict.ts --pin <SKILL.md>
 *
 * A surface's review is its highest `<dir>/<surface>/review-round-<n>.md`,
 * in the shape `.claude/skills/tk-ui-critic/SKILL.md` sets. It fails on: a
 * last line other than `Verdict: PASS`; any `[Blocking]` finding; any
 * UNVERIFIED line except the skill's own `Code lint:` line; a Coverage line
 * that is absent, short of its expected count or names a missing capture.
 * The set fails on no review at all, a listed surface with no review, and a
 * captured surface with no review. Anything it cannot read is a failure,
 * never a pass.
 *
 * `--pin` prints the model and effort the skill was calibrated on
 * ("claude-opus-5-5 medium"), so the job runs the critic on them and never
 * restates them.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROUND = /^review-round-(\d+)\.md$/;

/** The problems in one review's text; none means it passes. */
export function judgeReview(text: string): string[] {
  const problems: string[] = [];
  const lines = text.split("\n").map((l) => l.trimEnd());
  const last = lines.filter((l) => l.trim() !== "").at(-1) ?? "";
  const verdict = /^Verdict: (PASS|FAIL)$/.exec(last)?.[1];
  if (!verdict) problems.push("the last line is not `Verdict: PASS | FAIL`");
  else if (verdict === "FAIL") {
    const reason = lines.find((l) => l.startsWith("Reason:"));
    problems.push(`Verdict: FAIL${reason ? ` (${reason})` : ""}`);
  }

  const coverage = lines.find((l) => l.startsWith("Coverage:"));
  const counts = coverage
    ? /^Coverage: (\d+)\/(\d+) files read; missing: (.+)$/.exec(coverage)
    : null;
  if (!counts) problems.push("no readable Coverage line");
  else {
    const [, read, expected, missing] = counts;
    if (Number(expected) === 0 || read !== expected)
      problems.push(`coverage ${read}/${expected}`);
    if (missing!.trim() !== "none") problems.push(`missing: ${missing}`);
  }

  for (const line of lines) {
    if (/^- \[Blocking\]/.test(line)) problems.push(line.slice(2));
    else if (/\bUNVERIFIED\b/.test(line) && !line.startsWith("Code lint:"))
      problems.push(line);
  }
  return problems;
}

/** The highest round's file name in a surface folder, or null. */
function latestRound(folder: string): string | null {
  const rounds = readdirSync(folder)
    .map((name) => ({ name, n: Number(ROUND.exec(name)?.[1] ?? NaN) }))
    .filter((r) => !Number.isNaN(r.n))
    .sort((a, b) => b.n - a.n);
  return rounds[0]?.name ?? null;
}

/**
 * Every problem in a captures folder. A surface counts as captured when its
 * folder holds a PNG; `surfaces` names those that must have a review.
 */
export function judgeCaptures(dir: string, surfaces: string[] = []): string[] {
  if (!existsSync(dir)) return [`${dir} does not exist: no review at all`];
  const folders = readdirSync(dir).filter((name) =>
    statSync(path.join(dir, name)).isDirectory(),
  );
  const wanted = new Set(surfaces);
  for (const name of folders)
    if (readdirSync(path.join(dir, name)).some((f) => f.endsWith(".png")))
      wanted.add(name);

  const problems: string[] = [];
  let reviewed = 0;
  for (const surface of [...wanted].sort()) {
    const folder = path.join(dir, surface);
    const round = existsSync(folder) ? latestRound(folder) : null;
    if (!round) {
      problems.push(`${surface}: no review`);
      continue;
    }
    reviewed++;
    const text = readFileSync(path.join(folder, round), "utf8");
    for (const p of judgeReview(text))
      problems.push(`${surface}/${round}: ${p}`);
  }
  if (reviewed === 0 && wanted.size === 0) problems.push("no review at all");
  return problems;
}

/** The model and effort a skill says it was calibrated on, or null. */
export function readPin(
  skillText: string,
): { model: string; effort: string } | null {
  const m =
    /Calibrated on `([a-z0-9.-]+)` at (low|medium|high|xhigh|max) effort/.exec(
      skillText,
    );
  return m ? { model: m[1]!, effort: m[2]! } : null;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const args = process.argv.slice(2);
  const flag = (name: string) => {
    const i = args.indexOf(name);
    return i === -1 ? undefined : args[i + 1];
  };
  const pinFile = flag("--pin");
  if (pinFile !== undefined) {
    const pin = existsSync(pinFile)
      ? readPin(readFileSync(pinFile, "utf8"))
      : null;
    if (!pin) {
      console.error(`critic-verdict: no calibrated model pinned in ${pinFile}`);
      process.exit(1);
    }
    console.log(`${pin.model} ${pin.effort}`);
    process.exit(0);
  }
  const dir = args.find(
    (a, i) => !a.startsWith("--") && args[i - 1] !== "--surfaces",
  );
  if (!dir) {
    console.error("critic-verdict: name the captures folder");
    process.exit(2);
  }
  const surfaces = (flag("--surfaces") ?? "").split(",").filter(Boolean);
  const problems = judgeCaptures(path.resolve(dir), surfaces);
  if (problems.length) {
    console.error(
      `critic-verdict: FAIL, ${problems.length} problem(s)\n  ${problems.join("\n  ")}`,
    );
    process.exit(1);
  }
  console.log("critic-verdict: every review PASS");
}
