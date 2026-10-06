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
 * The group is checked, not trusted. The gate group is closed: only the
 * functions named in GATE_GROUP may be filed as `gate` (the Tickets-gate
 * ruling; LAB-6 adds its throttle's here). Every other function export must
 * be a `viewer` function of three parameters `(db, viewer, input)`, so a
 * scoped read cannot slip into `gate` or `support`, even with a default
 * parameter lowering its arity. `support` holds only classes and values.
 *
 * Type-only exports are erased at runtime and need no entry.
 */

/** The functions that run before any viewer exists; nothing else is filed as `gate`. */
export const GATE_GROUP: readonly string[] = [
  "findLiveReviewerByCodeHash",
  "createAccess",
  "checkAccess",
  "findAccessEmail",
  "readGateLock",
  "recordGateFailure",
  "clearGateKey",
];

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
  gateGroup: readonly string[] = GATE_GROUP,
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
    const value = module[name];
    const isFunction = typeof value === "function" && !isClass(value);
    const arity = isFunction ? (value as () => unknown).length : null;
    if (entry.group === "gate" && !gateGroup.includes(name))
      problems.push(`${name} is filed as gate but is not in the gate group`);
    else if (entry.group === "gate" && arity !== 2)
      problems.push(`${name} is filed as gate but does not take (db, input)`);
    if (isFunction && entry.group === "support")
      problems.push(`${name} is a function filed as support`);
    if (entry.group === "viewer" && arity !== 3)
      problems.push(
        `${name} is filed as viewer but does not take (db, viewer, input)`,
      );
    if (entry.group === "viewer") {
      for (const kind of VIEWER_KINDS)
        if (typeof entry.byViewer[kind] !== "function")
          problems.push(`${name} has no case for the ${kind}`);
    } else if (Object.keys(entry.cases).length === 0) {
      problems.push(`${name} has no isolation case`);
    }
  }
  for (const name of gateGroup)
    if (registry[name] && registry[name].group !== "gate")
      problems.push(
        `${name} is in the gate group but filed as ${registry[name].group}`,
      );
  for (const name of Object.keys(registry))
    if (!exported.includes(name))
      problems.push(`${name} is registered but not exported`);
  return problems;
}

function isClass(value: unknown): boolean {
  return (
    typeof value === "function" &&
    /^class\b/.test(Function.prototype.toString.call(value))
  );
}
