/**
 * The assess report: assess.md's data contract as JSON, and the same data as
 * the markdown the interview opens with (MIG T1). Sections a later ticket
 * fills (preconditions MIG-7; conflicts, sdkImports, records, collisions and
 * hygiene MIG-6) are present and empty until then.
 */

import { listPackages, runGit, type Repo } from "./repo.ts";
import {
  FAR_FROM,
  MIDDLE_FROM,
  NEAR_UP_TO,
  scoreSignals,
  type Path,
} from "./score.ts";
import type { SignalResult } from "./signal.ts";
import { measureSignals, SIGNALS } from "./signals.ts";

export type Precondition = { id: string; ok: boolean; fix: string };
export type Conflict = {
  policy: string;
  file: string;
  line: number;
  text: string;
};
export type SdkImport = { file: string; module: string; matchedBy: string };
export type RecordRow = { kind: string; path: string; lines: number };
export type Hygiene = Record<string, unknown>;

export type AssessData = {
  target: string;
  commit: string | null;
  toolkitCommit: string | null;
  signals: SignalResult[];
  total: number;
  path: Path | null;
  gate: { failed: boolean; reasons: string[] };
  preconditions: Precondition[];
  conflicts: Conflict[];
  sdkImports: SdkImport[];
  records: RecordRow[];
  collisions: string[];
  hygiene: Hygiene;
};

/** The toolkit checkout this script runs from: its commit, or null outside git. */
export const readToolkitCommit = (toolkitRoot: string) =>
  runGit(toolkitRoot, ["rev-parse", "HEAD"]);

export function assessRepo(repo: Repo, toolkitRoot: string): AssessData {
  const signals = measureSignals(repo, SIGNALS);
  const javascript = listPackages(repo).length > 0;
  const verdict = scoreSignals(signals, { javascript });
  return {
    target: repo.root,
    commit: repo.commit,
    toolkitCommit: readToolkitCommit(toolkitRoot),
    signals,
    total: verdict.total,
    path: verdict.path,
    gate: verdict.gate,
    preconditions: [],
    conflicts: [],
    sdkImports: [],
    records: [],
    collisions: [],
    hygiene: {},
  };
}

const GROUP_TITLES: Record<string, string> = {
  shape: "Shape",
  checks: "Checks",
  conventions: "Conventions",
  process: "Process",
};

const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");

export function renderMarkdown(data: AssessData): string {
  const verdict = scoreSignals(data.signals, {
    javascript: !data.gate.reasons.includes("not a JavaScript repo"),
  });
  const byId = new Map(SIGNALS.map((s) => [s.id, s]));
  const out: string[] = [
    `# Migration assessment: ${data.target.split("/").pop()}`,
    "",
    `- Target: \`${data.target}\` at \`${data.commit ?? "no commit"}\``,
    `- Toolkit: \`${data.toolkitCommit ?? "not a git checkout"}\``,
    `- Total: **${data.total}** of ${verdict.measured * 2} measured (${verdict.measured} of ${data.signals.length} signals)`,
    `- Gate: ${data.gate.failed ? `**failed** (${data.gate.reasons.join("; ")})` : "passed"}`,
    `- Path: **${data.path ?? "not decided"}**${pathWhy(data, verdict)}`,
  ];
  if (verdict.unmeasured.length)
    out.push(
      `- Not yet measured: ${verdict.unmeasured.join(", ")} (left out of the total; with them the total could reach ${verdict.ceiling})`,
    );
  for (const group of Object.keys(GROUP_TITLES)) {
    const rows = data.signals.filter((s) => byId.get(s.id)?.group === group);
    if (!rows.length) continue;
    out.push(
      "",
      `## ${GROUP_TITLES[group]}`,
      "",
      "| # | Signal | Layer | Score | Evidence |",
      "| --- | --- | --- | --- | --- |",
    );
    for (const s of rows) {
      const signal = byId.get(s.id);
      out.push(
        `| ${s.id} | ${cell(signal?.title ?? s.id)} | ${signal?.layer ?? ""} | ${s.score ?? "not yet measured"} | ${cell(s.evidence)} |`,
      );
    }
  }
  return `${out.join("\n")}\n`;
}

function pathWhy(
  data: AssessData,
  verdict: ReturnType<typeof scoreSignals>,
): string {
  if (data.gate.failed) return ` (the gate: ${data.gate.reasons.join("; ")})`;
  if (data.path === null)
    return ` (the measured total ${verdict.total} and the ceiling ${verdict.ceiling} fall in different bands)`;
  return ` (total ${data.total}: near up to ${NEAR_UP_TO}, middle ${MIDDLE_FROM} to ${FAR_FROM - 1}, far from ${FAR_FROM})`;
}
