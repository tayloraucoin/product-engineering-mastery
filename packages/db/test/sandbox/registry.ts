/**
 * The isolation registry's shape and its coverage guard (LAB-3). Every
 * runtime export of `@pem/db/sandbox` has an entry:
 *
 * - `viewer`: a function taking `(db, viewer, input)`. It has one case per
 *   viewer kind, so a new export cannot ship without saying what each kind
 *   may do with it.
 * - `gate`: a function of the gate group, which runs before any viewer
 *   exists. It has named cases, including what it returns.
 * - `support`: anything else exported at runtime, with the cases that pin it.
 *
 * Type-only exports are erased at runtime and need no entry.
 */

export const VIEWER_KINDS = [
  "reviewer on slug A",
  "second reviewer on slug A",
  "reviewer on slug B",
  "developer",
  "admin",
] as const;
export type ViewerKind = (typeof VIEWER_KINDS)[number];

export type Case<W> = (world: W) => Promise<void> | void;

export type RegistryEntry<W> = (
  | { group: "viewer"; byViewer: Record<ViewerKind, Case<W>> }
  | { group: "gate" | "support"; cases: Record<string, Case<W>> }
) & {
  /** Criterion ids the cases prove, beside C1, for the test names. */
  criteria?: string[];
};

export type Registry<W> = Record<string, RegistryEntry<W>>;

/** What the guard finds wrong: an export with no entry, an entry with no case, or an entry for nothing. */
export function coverageProblems<W>(
  module: Record<string, unknown>,
  registry: Registry<W>,
): string[] {
  const problems: string[] = [];
  const exported = Object.keys(module).filter(
    (name) => module[name] !== undefined,
  );
  for (const name of exported) {
    const entry = registry[name];
    if (!entry) {
      problems.push(`${name} has no isolation case`);
      continue;
    }
    if (entry.group === "viewer") {
      for (const kind of VIEWER_KINDS)
        if (typeof entry.byViewer[kind] !== "function")
          problems.push(`${name} has no case for the ${kind}`);
    } else if (Object.keys(entry.cases).length === 0) {
      problems.push(`${name} has no isolation case`);
    }
  }
  for (const name of Object.keys(registry))
    if (!exported.includes(name))
      problems.push(`${name} is registered but not exported`);
  return problems;
}
