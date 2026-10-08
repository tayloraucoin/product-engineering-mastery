/** Clause diff for the history summary and the Compare view (P-1). */

export type DiffRowKind = "same" | "removed" | "added";
export interface DiffRow {
  kind: DiffRowKind;
  text: string;
}

export interface DiffCounts {
  /** A removed clause paired with an added one in the same run. */
  changed: number;
  /** Added clauses with no removed clause to pair with. */
  added: number;
  /** Removed clauses with no added clause to pair with. */
  removed: number;
}

export interface ClauseDiff {
  rows: DiffRow[];
  counts: DiffCounts;
  summary: string;
}

/** Trimmed lines, empty lines dropped: how the form saves terms. */
export function normalizeClauses(lines: readonly string[]): string[] {
  return lines.map((line) => line.trim()).filter((line) => line !== "");
}

export function clausesEqual(
  a: readonly string[],
  b: readonly string[],
): boolean {
  return a.length === b.length && a.every((clause, i) => clause === b[i]);
}

/** "2 clauses changed, 1 added"; "No clause changes" when nothing differs. */
export function diffSummary(counts: DiffCounts): string {
  const parts: string[] = [];
  if (counts.changed > 0)
    parts.push(`${counts.changed} clause${counts.changed === 1 ? "" : "s"} changed`);
  if (counts.added > 0) parts.push(`${counts.added} added`);
  if (counts.removed > 0) parts.push(`${counts.removed} removed`);
  return parts.length > 0 ? parts.join(", ") : "No clause changes";
}

/**
 * Longest-common-subsequence diff. Rows keep both versions' order: the "same"
 * and "removed" rows rebuild `oldClauses`, the "same" and "added" rows rebuild
 * `newClauses`. Inside a changed run, removed rows come first.
 */
export function diffClauses(
  oldClauses: readonly string[],
  newClauses: readonly string[],
): ClauseDiff {
  const n = oldClauses.length;
  const m = newClauses.length;
  const lcs: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0),
  );
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      lcs[i]![j] =
        oldClauses[i] === newClauses[j]
          ? lcs[i + 1]![j + 1]! + 1
          : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!);

  const rows: DiffRow[] = [];
  const counts: DiffCounts = { changed: 0, added: 0, removed: 0 };
  let removedRun = 0;
  let addedRun = 0;
  const closeRun = () => {
    const paired = Math.min(removedRun, addedRun);
    counts.changed += paired;
    counts.removed += removedRun - paired;
    counts.added += addedRun - paired;
    removedRun = 0;
    addedRun = 0;
  };

  let i = 0;
  let j = 0;
  const pendingAdded: DiffRow[] = [];
  const flushAdded = () => {
    rows.push(...pendingAdded);
    pendingAdded.length = 0;
  };
  while (i < n || j < m) {
    if (i < n && j < m && oldClauses[i] === newClauses[j]) {
      flushAdded();
      closeRun();
      rows.push({ kind: "same", text: oldClauses[i]! });
      i++;
      j++;
    } else if (j >= m || (i < n && lcs[i + 1]![j]! >= lcs[i]![j + 1]!)) {
      rows.push({ kind: "removed", text: oldClauses[i]! });
      removedRun++;
      i++;
    } else {
      pendingAdded.push({ kind: "added", text: newClauses[j]! });
      addedRun++;
      j++;
    }
  }
  flushAdded();
  closeRun();

  return { rows, counts, summary: diffSummary(counts) };
}
