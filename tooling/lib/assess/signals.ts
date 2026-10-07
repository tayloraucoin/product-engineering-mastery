/**
 * The seventeen signals in table order (assess.md): S1, S2, C1 to C5, V1 to V5,
 * P1 to P5. The V and P detectors land with MIG-6; until then they report
 * "not yet measured" and score nothing.
 */

import { C1, C2, C3, C4, C5 } from "./checks.ts";
import type { Repo } from "./repo.ts";
import { S1, S2 } from "./shape.ts";
import { notYetMeasured, type Signal, type SignalResult } from "./signal.ts";

const pending = (
  id: string,
  group: Signal["group"],
  layer: Signal["layer"],
  title: string,
): Signal => ({ id, group, layer, title, measure: notYetMeasured });

export const SIGNALS: Signal[] = [
  S1,
  S2,
  C1,
  C2,
  C3,
  C4,
  C5,
  pending("V1", "conventions", 3, "Boundaries lint"),
  pending("V2", "conventions", 3, "Token preset"),
  pending("V3", "conventions", 3, "process.env outside env.ts"),
  pending("V4", "conventions", 3, '"use client" outside _components/'),
  pending("V5", "conventions", 3, "SDK importers no reviewer glob matches"),
  pending("P1", "process", 1, "Instruction lines that conflict"),
  pending("P2", "process", 1, "Docs with frontmatter"),
  pending("P3", "process", 1, "Record kinds in a foreign format"),
  pending("P4", "process", 1, "Living truth"),
  pending("P5", "process", 1, "Doc paths with spaces or non-ASCII"),
];

export function measureSignals(
  repo: Repo,
  signals: Signal[] = SIGNALS,
): SignalResult[] {
  return signals.map((signal) => {
    try {
      return { id: signal.id, ...signal.measure(repo) };
    } catch (error) {
      return {
        id: signal.id,
        value: null,
        score: null,
        evidence: `detector failed: ${(error as Error).message}`,
      };
    }
  });
}
