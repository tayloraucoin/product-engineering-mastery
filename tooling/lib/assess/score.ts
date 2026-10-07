/**
 * The path rule (MIG T1, assess.md "Path thresholds").
 *
 * Far: the shape gate fails (S1 = 2), the target is not a JavaScript repo, or
 * the total is FAR_FROM or more. Middle: MIDDLE_FROM to FAR_FROM - 1. Near:
 * NEAR_UP_TO or less. The thresholds are judgment, calibrated on synapse (14),
 * conscious-connections (18) and taylor-aucoin (23 and the gate), and named
 * here so the synapse dry run can move them.
 *
 * A signal not yet measured scores nothing. While any is unmeasured the path
 * is decided only when every score it could still take lands in one band, so a
 * half-built assess never prints a false near.
 */

import type { Score } from "./signal.ts";

export const FAR_FROM = 22;
export const MIDDLE_FROM = 16;
/** Derived, so moving MIDDLE_FROM moves the near band with it. */
export const NEAR_UP_TO = MIDDLE_FROM - 1;
export const MAX_SCORE = 2;

export type Path = "near" | "middle" | "far";

export type Verdict = {
  total: number;
  /** The highest total the unmeasured signals still allow. */
  ceiling: number;
  measured: number;
  unmeasured: string[];
  path: Path | null;
  gate: { failed: boolean; reasons: string[] };
};

export const pathOf = (total: number): Path =>
  total >= FAR_FROM ? "far" : total >= MIDDLE_FROM ? "middle" : "near";

export function scoreSignals(
  signals: { id: string; score: Score | null }[],
  options: { javascript: boolean } = { javascript: true },
): Verdict {
  const measured = signals.filter((s) => s.score !== null);
  const unmeasured = signals.filter((s) => s.score === null).map((s) => s.id);
  const total = measured.reduce((sum, s) => sum + (s.score ?? 0), 0);
  const ceiling = total + unmeasured.length * MAX_SCORE;
  const reasons: string[] = [];
  if (signals.find((s) => s.id === "S1")?.score === 2)
    reasons.push("S1 = 2: no workspaces and no turbo.json");
  if (!options.javascript) reasons.push("not a JavaScript repo");
  const failed = reasons.length > 0;
  const low = pathOf(total);
  const path: Path | null = failed
    ? "far"
    : low === pathOf(ceiling)
      ? low
      : null;
  return {
    total,
    ceiling,
    measured: measured.length,
    unmeasured,
    path,
    gate: { failed, reasons },
  };
}
