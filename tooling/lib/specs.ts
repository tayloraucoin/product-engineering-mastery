/**
 * The work loop's model (J5; E-22 to E-26, A4 to A9, A13.2): where tickets and
 * epics live, what a contract and a results file hold, which reviewers a
 * ticket needs, and whether each recorded PASS still holds.
 *
 * Every script of the loop reads the specs tree through here, so the layout,
 * the hashing and the staleness rule have one home.
 */

import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path, { matchesGlob } from "node:path";
import YAML from "yaml";

import {
  estimateTokens,
  listFiles,
  REPO_ROOT,
  splitFrontmatter,
} from "./docs.ts";
import {
  getBaseRef,
  isAncestor,
  listChangedAgainstBase,
  listChangedSince,
  readOnRef,
  runGit,
} from "./git.ts";
import { validateJson } from "./json-schema.ts";
import type { Toolkit } from "./toolkit.ts";

// ---------------------------------------------------------------- constants

export const EVIDENCE_TYPES = ["test", "check", "capture", "manual"] as const;
export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

/** The ticket is the whole brief: frontmatter plus its Build notes (PR-15). */
export const CONTRACT_TOKEN_CAP = 2500;
/** A10's spec-file caps, enforced with a message that says to split. */
export const SPEC_FILE_CAPS = {
  surface: 2000,
  overview: 1500,
  technical: 2000,
} as const;
export const MAX_NON_NEGOTIABLES = 7;

/** The sections every as-built carries (PR-15). Migrations and Test changes are added when the ticket has any. */
export const AS_BUILT_SECTIONS = [
  "Shipped against the contract",
  "Deviations",
  "Not verified",
  "Next",
] as const;

/**
 * The QA tier a ticket's planned paths put it in (PR-15):
 *   0  docs and data only: its scripted criteria, no reviewer;
 *   1  code: its criteria, and one review of the whole batch at batch close;
 *   2  a one-way door (the paths below): the pre-flight, and Vigil plus the
 *      toolkit.json specialists on the ticket itself.
 * A contract's own `tier:` wins; contract:tier sets it.
 */
export type Tier = 0 | 1 | 2;
export const TIER_2_PATHS = [
  /(^|\/)(migrations|schema|policies|db|auth|billing|webhooks)(\/|$)/,
  /(^|\/)(env|proxy)\.ts$/,
  /\.sql$/,
  /^\.claude\/settings\.json$/,
  /^tooling\/hooks\//,
];

export const CONTRACT_TEMPLATE =
  "docs/engineering/templates/contract.template.md";
export const AS_BUILT_TEMPLATE =
  "docs/engineering/templates/as-built.template.md";
export const RESULTS_SCHEMA = "docs/engineering/schemas/results.schema.json";
export const CONTRACT_SCHEMA = "docs/engineering/schemas/contract.schema.json";

export const BLOCKING_MARKER = "[NEEDS DECISION — BLOCKING]";
export const OPEN_MARKER = "[NEEDS DECISION]";
/** Set only by the contract-loop harness: lets a fixture review runner count. */
export const FIXTURE_ENV = "PEM_SPECS_FIXTURE";

const PREFIX = "[A-Z][A-Z0-9]{1,4}";
export const WORK_ID = new RegExp(`^(${PREFIX})-([1-9][0-9]*)$`);
const FOLDER = new RegExp(
  `^(${PREFIX})-([1-9][0-9]*)-([a-z0-9]+(?:-[a-z0-9]+)*)$`,
);
const EPIC_FOLDER = new RegExp(`^(${PREFIX})-([a-z0-9]+(?:-[a-z0-9]+)*)$`);
export const EPIC_PREFIX = new RegExp(`^${PREFIX}$`);
export const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// ---------------------------------------------------------------- types

export type Criterion = {
  id: string;
  statement: string;
  evidence: EvidenceType;
  command?: string;
  path?: string;
  reason?: string;
};

export type Contract = {
  id: string;
  size: "small" | "medium" | "large";
  objective: string;
  slice_type: string;
  non_negotiables: string[];
  devs_call: string;
  cites: string[];
  waiver?: string;
  truth_files: string[] | string;
  reviewers: string[];
  planned_paths: string[];
  depends_on: string[];
  out_of_scope: string[];
  criteria: Criterion[];
  tier?: Tier;
  /** Taylor looks the ticket over himself: contract:init adds a manual criterion for it (PR-16). */
  operator_review?: boolean;
};

export type RunRecord = {
  command: string;
  exit: number;
  at: string;
  head: string;
  evidence_path: string;
  evidence_sha256: string;
  tests?: number;
  contract_sha256?: string;
  as_built_sha256?: string;
  runner?: string;
  /** A manual criterion only a person can check, handed to the operator: it never holds the ticket (PR-16). */
  deferred?: boolean;
};

export type CriterionResult = {
  status: "PASS" | "FAIL";
  evidence: EvidenceType;
  run: RunRecord | null;
};

export type Results = {
  id: string;
  criteria_sha256: string;
  criteria: Record<string, CriterionResult>;
  updated_at: string;
};

export type Epic = {
  prefix: string;
  slug: string;
  app: string;
  /** Repo-relative folder. */
  dir: string;
};

export type Item = {
  id: string;
  prefix: string;
  number: number;
  slug: string;
  app: string;
  kind: "one-off" | "epic ticket";
  epic: Epic | null;
  /** Repo-relative folder. */
  dir: string;
};

export type SpecsTree = {
  specsRoot: string;
  epics: Epic[];
  items: Item[];
  /** Layout problems: misnamed folders, duplicate ids and prefixes. */
  problems: string[];
};

// ---------------------------------------------------------------- files

const abs = (rel: string) => path.join(REPO_ROOT, rel);
export const fileExists = (rel: string) => existsSync(abs(rel));
const isDir = (rel: string) =>
  fileExists(rel) && statSync(abs(rel)).isDirectory();
const listDir = (rel: string) =>
  isDir(rel) ? readdirSync(abs(rel)).sort() : [];
export const readRepoText = (rel: string) => readFileSync(abs(rel), "utf8");

export const hashText = (text: string | Buffer) =>
  createHash("sha256").update(text).digest("hex");
export const hashFile = (rel: string) => hashText(readFileSync(abs(rel)));

/** The header contract:run writes atop a log, before its `---`; null when there is none. */
export function readRunHeader(
  rel: string,
): { command: string; at: string; head: string } | null {
  const text = readRepoText(rel);
  const end = text.indexOf("\n---\n");
  if (end === -1) return null;
  const fields = new Map(
    text
      .slice(0, end)
      .split("\n")
      .map((line) => line.match(/^([a-z]+): (.*)$/))
      .filter((m) => m !== null)
      .map((m) => [m[1]!, m[2]!]),
  );
  const [command, at, head] = ["command", "at", "head"].map((k) =>
    fields.get(k),
  );
  return command && at && head ? { command, at, head } : null;
}

export const contractPath = (item: Item) => `${item.dir}/contract.md`;
export const resultsPath = (item: Item) => `${item.dir}/results.json`;
export const asBuiltPath = (item: Item) => `${item.dir}/as-built.md`;
export const reviewPath = (item: Item, role: string) =>
  `${item.dir}/review-${role}.md`;
export const evidenceDir = (item: Item) => `${item.dir}/evidence`;
export const preflightPath = (epic: Epic) =>
  `${epic.dir}/tickets/_preflight.md`;
export const statusPath = (specsRoot: string) => `${specsRoot}/_status.md`;

export const compareIds = (a: string, b: string) => {
  const [pa, na] = a.split("-");
  const [pb, nb] = b.split("-");
  return pa === pb ? Number(na) - Number(nb) : pa!.localeCompare(pb!);
};

/** Every prefix the layout claims before any epic does: toolkit and app prefixes. */
export const reservedPrefixes = (toolkit: Toolkit) => [
  ...toolkit.toolkitPrefixes,
  ...Object.values(toolkit.apps).map((app) => app.prefix),
];

// ---------------------------------------------------------------- the tree

/**
 * Reads the specs tree (A4): `<specsRoot>/<app | _shared>/{ux, epics, one-offs}`.
 * `specsRoot` defaults to toolkit.json's; check-specs passes a fixture's.
 */
export function readSpecsTree(
  toolkit: Toolkit,
  specsRoot: string = toolkit.specsRoot,
): SpecsTree {
  const problems: string[] = [];
  const epics: Epic[] = [];
  const items: Item[] = [];
  const apps = new Set([...Object.keys(toolkit.apps), "_shared"]);

  for (const app of listDir(specsRoot)) {
    const appDir = `${specsRoot}/${app}`;
    if (!isDir(appDir)) {
      if (app !== "_status.md")
        problems.push(
          `${appDir} is not part of the layout; ${specsRoot}/ holds _status.md and one folder per app (A4)`,
        );
      continue;
    }
    if (!apps.has(app)) {
      problems.push(
        `${appDir}/ is not an app in toolkit.json; use one of ${[...apps].join(", ")}`,
      );
      continue;
    }
    for (const part of listDir(appDir)) {
      if (!["ux", "epics", "one-offs"].includes(part))
        problems.push(
          `${appDir}/${part} is not part of the layout; an app folder holds ux/, epics/ and one-offs/`,
        );
    }

    const appPrefix = toolkit.apps[app]?.prefix ?? null;
    for (const name of listDir(`${appDir}/one-offs`)) {
      const dir = `${appDir}/one-offs/${name}`;
      const match = name.match(FOLDER);
      if (!match || !isDir(dir)) {
        problems.push(
          `${dir} is not named <PREFIX>-<n>-<slug>; create one-offs with yarn contract:init`,
        );
        continue;
      }
      if (match[1] !== appPrefix) {
        problems.push(
          `${dir}: a one-off in ${app}/ uses the app's prefix ${appPrefix ?? "(none: _shared work is an epic)"}, not ${match[1]}`,
        );
        continue;
      }
      items.push({
        id: `${match[1]}-${match[2]}`,
        prefix: match[1]!,
        number: Number(match[2]),
        slug: match[3]!,
        app,
        kind: "one-off",
        epic: null,
        dir,
      });
    }

    for (const name of listDir(`${appDir}/epics`)) {
      const dir = `${appDir}/epics/${name}`;
      const match = name.match(EPIC_FOLDER);
      if (!match || !isDir(dir)) {
        problems.push(
          `${dir} is not named <EPIC>-<slug>; create epics with yarn spec:init`,
        );
        continue;
      }
      const epic: Epic = { prefix: match[1]!, slug: match[2]!, app, dir };
      epics.push(epic);
      for (const ticket of listDir(`${dir}/tickets`)) {
        const tdir = `${dir}/tickets/${ticket}`;
        if (!isDir(tdir)) {
          if (ticket !== "_preflight.md" && ticket !== ".gitkeep")
            problems.push(
              `${tdir} is not part of the layout; tickets/ holds ticket folders and _preflight.md`,
            );
          continue;
        }
        const tmatch = ticket.match(FOLDER);
        if (!tmatch || tmatch[1] !== epic.prefix) {
          problems.push(
            `${tdir} is not named ${epic.prefix}-<n>-<slug>; create tickets with yarn contract:init ${epic.prefix} <slug>`,
          );
          continue;
        }
        items.push({
          id: `${tmatch[1]}-${tmatch[2]}`,
          prefix: tmatch[1]!,
          number: Number(tmatch[2]),
          slug: tmatch[3]!,
          app,
          kind: "epic ticket",
          epic,
          dir: tdir,
        });
      }
    }
  }

  // Duplicate prefixes (A4): an epic's prefix is unique in the repo and never an app's or the toolkit's.
  const reserved = new Set(reservedPrefixes(toolkit));
  const seen = new Map<string, string>();
  for (const epic of epics) {
    if (reserved.has(epic.prefix))
      problems.push(
        `${epic.dir}: the prefix ${epic.prefix} belongs to toolkit.json; rename the epic with a free prefix`,
      );
    const other = seen.get(epic.prefix);
    if (other)
      problems.push(
        `${epic.dir}: the prefix ${epic.prefix} is already used by ${other}; an epic prefix is unique in the repo`,
      );
    else seen.set(epic.prefix, epic.dir);
  }
  const ids = new Map<string, string>();
  for (const item of items) {
    const other = ids.get(item.id);
    if (other)
      problems.push(
        `${item.dir}: the id ${item.id} is already used by ${other}; ids are allocated by yarn contract:init, never typed`,
      );
    else ids.set(item.id, item.dir);
  }

  items.sort((a, b) => compareIds(a.id, b.id));
  epics.sort((a, b) => a.prefix.localeCompare(b.prefix));
  return { specsRoot, epics, items, problems };
}

export const findItem = (tree: SpecsTree, id: string) =>
  tree.items.find((item) => item.id === id) ?? null;

// ---------------------------------------------------------------- contracts

const schemaCache: Record<string, Record<string, unknown>> = {};
export function readSchema(rel: string): Record<string, unknown> {
  schemaCache[rel] ??= JSON.parse(readRepoText(rel)) as Record<string, unknown>;
  return schemaCache[rel]!;
}

export type ContractFile = {
  contract: Contract | null;
  /** Raw text, for hashing and the token cap. */
  text: string;
  /** Raw frontmatter text, for edits that keep its layout. */
  rawFrontmatter: string | null;
  body: string;
  problems: string[];
};

export function readContract(item: Item): ContractFile {
  const rel = contractPath(item);
  if (!fileExists(rel))
    return {
      contract: null,
      text: "",
      rawFrontmatter: null,
      body: "",
      problems: [`${rel} is missing; run yarn contract:init to write it`],
    };
  const text = readRepoText(rel);
  const { raw, body } = splitFrontmatter(text);
  if (raw === null)
    return {
      contract: null,
      text,
      rawFrontmatter: null,
      body,
      problems: [
        `${rel} has no frontmatter; copy the fields from ${CONTRACT_TEMPLATE}`,
      ],
    };
  let data: unknown;
  try {
    data = YAML.parse(raw);
  } catch (error) {
    return {
      contract: null,
      text,
      rawFrontmatter: raw,
      body,
      problems: [
        `${rel}: the frontmatter is not valid YAML (${error instanceof Error ? error.message.split("\n")[0] : String(error)})`,
      ],
    };
  }
  const problems = validateJson(data, readSchema(CONTRACT_SCHEMA)).map(
    (problem) =>
      `${rel}: ${problem.replace(/^\$\.?/, "") || "the frontmatter"} (${CONTRACT_SCHEMA})`,
  );
  return {
    contract: problems.length ? null : (data as Contract),
    text,
    rawFrontmatter: raw,
    body,
    problems,
  };
}

/** The frozen form of a criteria set: what `criteria_sha256` hashes (A13.2). */
export function hashCriteria(criteria: Criterion[]): string {
  const canonical = criteria.map((criterion) =>
    Object.fromEntries(
      Object.entries(criterion).sort(([a], [b]) => a.localeCompare(b)),
    ),
  );
  return hashText(JSON.stringify(canonical));
}

export const isReview = (criterion: { id: string }) =>
  criterion.id.startsWith("review:");
export const reviewRole = (criterionId: string) =>
  criterionId.replace(/^review:/, "");

export const truthFilesOf = (contract: Contract) =>
  Array.isArray(contract.truth_files) ? contract.truth_files : [];

/** A cited entry is a file when it names a path; otherwise it is a decision or criterion id. */
export const isCitedFile = (entry: string) => entry.includes("/");

/**
 * A `test` or `check` command is a package.json script, run through yarn
 * (A13.2): `yarn <script> [args]` or `yarn workspace <name> <script> [args]`.
 * Returns the problem, or null.
 */
export function checkCommand(command: string): string | null {
  const words = splitCommand(command);
  if (words[0] !== "yarn")
    return `"${command}" is not a yarn script; test and check commands are package.json scripts run as yarn <script>`;
  let scripts: Record<string, string> = {};
  let script = words[1];
  let where = "package.json";
  if (script === "workspace") {
    const name = words[2];
    script = words[3];
    const workspace = findWorkspace(name ?? "");
    if (!workspace)
      return `"${command}" names the workspace ${name}, which does not exist`;
    where = `${workspace}/package.json`;
  }
  try {
    scripts =
      (JSON.parse(readRepoText(where)) as { scripts?: Record<string, string> })
        .scripts ?? {};
  } catch {
    return `${where} cannot be read`;
  }
  if (!script || !(script in scripts))
    return `"${command}" runs ${script ?? "nothing"}, which is not a script in ${where}; add the script, then cite it`;
  return null;
}

function findWorkspace(name: string): string | null {
  for (const group of ["apps", "packages"])
    for (const dir of listDir(group)) {
      const rel = `${group}/${dir}/package.json`;
      if (!fileExists(rel)) continue;
      try {
        if ((JSON.parse(readRepoText(rel)) as { name?: string }).name === name)
          return `${group}/${dir}`;
      } catch {
        // An unreadable package.json is the build's problem, not this check's.
      }
    }
  return null;
}

/** Splits a command into words, honouring single and double quotes. No expansion. */
export function splitCommand(command: string): string[] {
  const words: string[] = [];
  let word: string | null = null;
  let quote: string | null = null;
  for (const c of command) {
    if (quote) {
      if (c === quote) quote = null;
      else word = (word ?? "") + c;
    } else if (c === "'" || c === '"') {
      quote = c;
      word ??= "";
    } else if (/\s/.test(c)) {
      if (word !== null) words.push(word);
      word = null;
    } else word = (word ?? "") + c;
  }
  if (word !== null) words.push(word);
  return words;
}

// ---------------------------------------------------------------- reviewers

/** Concrete paths a planned path stands for, so a glob can be tested against the reviewer globs. */
function samplePaths(
  planned: string,
  toolkit: Toolkit,
  tracked: string[],
): string[] {
  if (!/[*?[{]/.test(planned)) return [planned];
  const basenames = new Set(["x", "x.ts", "x.tsx", "x.md", "x.json", "x.sql"]);
  for (const row of toolkit.reviewers) {
    const last = row.glob.split("/").at(-1)!;
    if (!/[*?[{]/.test(last)) basenames.add(last);
    else if (/^\*\.[a-z]+$/.test(last)) basenames.add(`x${last.slice(1)}`);
  }
  const segments = planned.split("/");
  const last = segments.pop()!;
  const heads = [""];
  for (const segment of segments) {
    const next: string[] = [];
    for (const head of heads) {
      if (segment === "**") next.push(head, `${head}x/`);
      else next.push(`${head}${segment.includes("*") ? "x" : segment}/`);
    }
    heads.splice(0, heads.length, ...next);
  }
  const lasts =
    last === "**"
      ? [...basenames].flatMap((name) => [name, `x/${name}`])
      : [...basenames].filter((name) => matchesGlob(name, last));
  const samples = heads.flatMap((head) => lasts.map((name) => head + name));
  return [...samples, ...tracked.filter((file) => matchesGlob(file, planned))];
}

export type RequiredReviewers = Map<string, string[]>;
let trackedCache: string[] | null = null;

/**
 * The reviewers a contract needs (A7, A13.2): every toolkit.json row whose
 * glob its planned paths reach, plus Vigil for every epic ticket and for a
 * one-off that touches a one-way door (a Mason row), names truth files, or
 * reports test changes. Globs are compared by sampling; J8's risk-tier reads
 * the real diff.
 */
export function computeReviewers(
  contract: Pick<Contract, "planned_paths" | "truth_files">,
  item: Pick<Item, "kind">,
  toolkit: Toolkit,
  options: { testChanges?: boolean } = {},
): RequiredReviewers {
  const required: RequiredReviewers = new Map();
  const add = (role: string, why: string) =>
    required.set(role, [...(required.get(role) ?? []), why]);
  trackedCache ??= (runGit(["ls-files"]) ?? "").split("\n").filter(Boolean);
  const tracked = trackedCache;

  for (const planned of contract.planned_paths) {
    const samples = samplePaths(planned, toolkit, tracked);
    for (const row of toolkit.reviewers)
      if (samples.some((sample) => matchesGlob(sample, row.glob)))
        add(row.role, `${planned} reaches ${row.glob}`);
  }
  if (item.kind === "epic ticket") add("vigil", "every epic ticket");
  else {
    if (required.has("mason"))
      add("vigil", "a one-off touching a one-way door");
    if (Array.isArray(contract.truth_files) && contract.truth_files.length > 0)
      add("vigil", "a one-off that changes living truth files");
    if (options.testChanges) add("vigil", "a one-off with test changes");
  }
  return required;
}

const isNonCode = (planned: string) =>
  planned.startsWith("docs/") ||
  planned.startsWith("specs/") ||
  (/\.(md|mdx|json|txt)$/.test(planned) && !planned.endsWith("package.json"));

/** A ticket's tier: its contract's `tier:`, or computed from its planned paths. */
export function tierOf(
  contract: Pick<Contract, "planned_paths" | "tier">,
  toolkit: Toolkit,
): Tier {
  if (contract.tier !== undefined) return contract.tier;
  // A planned path reaches a door when it names one, or when it is a glob
  // that holds a tracked door file. Never by sampling: a folder glob does not
  // become a door because an env.ts could one day sit in it.
  trackedCache ??= (runGit(["ls-files"]) ?? "").split("\n").filter(Boolean);
  const tracked = trackedCache;
  const isDoor = (file: string) => TIER_2_PATHS.some((door) => door.test(file));
  const reachesDoor = contract.planned_paths.some(
    (planned) =>
      isDoor(planned) ||
      (/[*?[{]/.test(planned) || planned.endsWith("/")
        ? tracked.some(
            (file) => inPlannedPaths(file, [planned]) && isDoor(file),
          )
        : false),
  );
  if (reachesDoor) return 2;
  return contract.planned_paths.every(isNonCode) ? 0 : 1;
}

/** The reviewers a ticket must carry: computeReviewers' set at tier 2, none below it (PR-15). */
export function requiredReviewers(
  contract: Pick<Contract, "planned_paths" | "truth_files" | "tier">,
  item: Pick<Item, "kind">,
  toolkit: Toolkit,
  options: { testChanges?: boolean } = {},
): RequiredReviewers {
  return tierOf(contract, toolkit) === 2
    ? computeReviewers(contract, item, toolkit, options)
    : new Map();
}

export function reviewCriterion(role: string): Criterion {
  return {
    id: `review:${role}`,
    statement: `${role[0]!.toUpperCase()}${role.slice(1)} reviews this ticket in fresh context against its contract and evidence.`,
    evidence: "manual",
    reason: `a reviewer's judgment, recorded only by yarn review:run ${role} <id>`,
  };
}

/** The role file a review loads: docs/roles/<department>/<role>-<title>.md. */
export function findRoleFile(role: string): string | null {
  return (
    listFiles("docs/roles").find((file) =>
      path.posix.basename(file).startsWith(`${role}-`),
    ) ?? null
  );
}

// ---------------------------------------------------------------- results

export function readResults(item: Item): {
  results: Results | null;
  problems: string[];
} {
  const rel = resultsPath(item);
  if (!fileExists(rel)) return { results: null, problems: [] };
  let data: unknown;
  try {
    data = JSON.parse(readRepoText(rel));
  } catch {
    return {
      results: null,
      problems: [
        `${rel} is not valid JSON; it is written only by tooling: git restore it, then re-run yarn contract:run ${item.id}`,
      ],
    };
  }
  const problems = validateJson(data, readSchema(RESULTS_SCHEMA)).map(
    (problem) => `${rel}: ${problem.replace(/^\$\.?/, "")} (${RESULTS_SCHEMA})`,
  );
  return { results: problems.length ? null : (data as Results), problems };
}

/** Serializes results with a stable key order, so a diff shows only what changed. */
export function formatResults(results: Results): string {
  const criteria = Object.fromEntries(
    Object.entries(results.criteria).map(([id, result]) => [
      id,
      {
        status: result.status,
        evidence: result.evidence,
        run: result.run && {
          command: result.run.command,
          exit: result.run.exit,
          at: result.run.at,
          head: result.run.head,
          evidence_path: result.run.evidence_path,
          evidence_sha256: result.run.evidence_sha256,
          ...(result.run.tests !== undefined && { tests: result.run.tests }),
          ...(result.run.contract_sha256 && {
            contract_sha256: result.run.contract_sha256,
          }),
          ...(result.run.as_built_sha256 && {
            as_built_sha256: result.run.as_built_sha256,
          }),
          ...(result.run.runner && { runner: result.run.runner }),
          ...(result.run.deferred && { deferred: true }),
        },
      },
    ]),
  );
  return `${JSON.stringify(
    {
      id: results.id,
      criteria_sha256: results.criteria_sha256,
      criteria,
      updated_at: results.updated_at,
    },
    null,
    2,
  )}\n`;
}

export const now = () => new Date().toISOString().replace(/\.\d+Z$/, "Z");

// ---------------------------------------------------------------- as-built

export type AsBuilt = {
  sections: Map<string, string>;
  /** The Migrations section's `applied:` value: n/a, pending or a date. */
  applied: string | null;
  text: string;
};

export function parseAsBuilt(text: string): AsBuilt {
  const { body } = splitFrontmatter(text);
  const sections = new Map<string, string>();
  const parts = body.split(/^## /m).slice(1);
  for (const part of parts) {
    const newline = part.indexOf("\n");
    const heading = (newline === -1 ? part : part.slice(0, newline)).trim();
    sections.set(heading, newline === -1 ? "" : part.slice(newline + 1).trim());
  }
  const applied =
    (sections.get("Migrations") ?? "")
      .match(/^applied:\s*(.+)$/m)?.[1]
      ?.trim() ?? null;
  return { sections, applied, text };
}

/** A section counts as empty when it says nothing, or only "none". */
export const isEmptySection = (text: string | undefined) =>
  !text ||
  /^(none|n\/a|-)\.?$/i.test(text.replace(/<!--[\s\S]*?-->/g, "").trim());

/** The as-built with its `applied:` value blanked: the part that is immutable after merge. */
export const withoutApplied = (text: string) =>
  text.replace(/^applied:.*$/m, "applied:");

// ---------------------------------------------------------------- status

export type CriterionState = {
  id: string;
  evidence: EvidenceType;
  /** PASS only when the recorded PASS still holds. */
  status: "PASS" | "FAIL";
  /** Why it is not PASS, or why a recorded PASS does not hold. */
  reason: string | null;
  /** A recorded PASS that fails its run record: a defect, not work left to do. */
  tampered: boolean;
  /** A recorded PASS the code or the contract has since outrun (B2). */
  stale: boolean;
  /** Handed to the operator: counts as done for the ticket, listed under Operator checks. */
  deferred: boolean;
};

export type ItemState = {
  item: Item;
  contract: Contract | null;
  results: Results | null;
  criteria: CriterionState[];
  hasAsBuilt: boolean;
  merged: boolean;
  stage:
    "draft" | "open" | "proven" | "closing" | "closed" | "migration pending";
};

type Git = {
  base: string | null;
  changedAgainstBase: string[] | null;
  head: string | null;
};
let gitCache: Git | null = null;
/** check-specs' static fixtures turn git off: their run records name no real commit. */
export function disableGit() {
  gitCache = { base: null, changedAgainstBase: null, head: null };
}
/** Reads git again on the next call (after fixtures ran with it off). */
export function enableGit() {
  gitCache = null;
}
function gitFacts(): Git {
  gitCache ??= {
    base: getBaseRef(),
    changedAgainstBase: listChangedAgainstBase(),
    head: runGit(["rev-parse", "HEAD"]),
  };
  return gitCache;
}

/** Whether an item's as-built is on the base branch: merged, so frozen rather than live. */
export function isMerged(item: Item): boolean {
  const { base } = gitFacts();
  return base !== null && readOnRef(base, asBuiltPath(item)) !== null;
}

/** Whether a repo path is one of an item's planned paths: a file, a folder ending in "/", or a glob. */
export function inPlannedPaths(file: string, planned: string[]): boolean {
  return planned.some((p) =>
    p.endsWith("/") ? file.startsWith(p) : matchesGlob(file, p),
  );
}

/**
 * This item's planned paths changed after `commit`, in this branch's change.
 * Only its own paths: tickets share the operator's branch, so another ticket's
 * commit never stales this one's proof (PR-14). The specs root is outside it:
 * records and living truth are not what evidence proves (A8).
 */
function changedAfter(
  commit: string,
  planned: string[],
  specsRoot: string,
): string[] {
  const { changedAgainstBase } = gitFacts();
  const branch = new Set(changedAgainstBase ?? []);
  return listChangedSince(commit).filter(
    (file) =>
      branch.has(file) &&
      !file.startsWith(`${specsRoot}/`) &&
      inPlannedPaths(file, planned),
  );
}

/**
 * Whether each criterion's recorded status still holds (A9, A13.2): a PASS
 * needs a run record, an evidence file whose hash matches, the contract's
 * command, at least one test for a test criterion, and no later change to
 * its planned paths in the branch's diff.
 */
export function readItemState(item: Item, specsRoot: string): ItemState {
  const { contract } = readContract(item);
  const { results } = readResults(item);
  const hasAsBuilt = fileExists(asBuiltPath(item));
  const merged = hasAsBuilt && isMerged(item);
  const { head } = gitFacts();
  const criteria: CriterionState[] = [];
  // A closed ticket's proofs are frozen (PR-16): every criterion recorded PASS
  // and the as-built written. A later edit to a file it shares with another
  // ticket no longer reopens it; the batch's yarn verify guards regressions.
  const frozen =
    hasAsBuilt &&
    (contract?.criteria ?? []).every(
      (c) => results?.criteria[c.id]?.status === "PASS",
    );

  for (const criterion of contract?.criteria ?? []) {
    const result = results?.criteria[criterion.id];
    const state: CriterionState = {
      id: criterion.id,
      evidence: criterion.evidence,
      status: "FAIL",
      reason: null,
      tampered: false,
      stale: false,
      deferred: false,
    };
    criteria.push(state);
    const fail = (reason: string, kind?: "tampered" | "stale") => {
      state.reason = reason;
      if (kind === "tampered") state.tampered = true;
      if (kind === "stale") state.stale = true;
    };
    if (!result) {
      fail("not in results.json");
      continue;
    }
    const run = result.run;
    if (result.status === "FAIL") {
      fail(
        !run
          ? "not proven yet"
          : run.tests === 0
            ? "the runner matched zero tests"
            : `last run exited ${run.exit}`,
      );
      continue;
    }
    if (!run) {
      fail(
        "PASS with no run record; results are written only by tooling (A9)",
        "tampered",
      );
      continue;
    }
    if (!fileExists(run.evidence_path)) {
      fail(`evidence ${run.evidence_path} is missing`, "tampered");
      continue;
    }
    if (hashFile(run.evidence_path) !== run.evidence_sha256) {
      // A newer contract:run has written this log and not yet its result
      // (another thread on the shared branch, PR-14, or a run that stopped
      // between the two): work in flight, not an edit. A log whose header is
      // the recorded run's, an older one, none, one from the future or from a
      // commit outside this branch was edited. No run writes a merged log.
      const header =
        !merged &&
        (criterion.evidence === "test" || criterion.evidence === "check")
          ? readRunHeader(run.evidence_path)
          : null;
      const newer =
        header !== null &&
        header.command === run.command &&
        header.at <= now() &&
        (head === null || isAncestor(header.head, head)) &&
        (header.at > run.at ||
          (header.at === run.at && header.head !== run.head));
      if (newer)
        fail(
          `evidence ${run.evidence_path} is from a newer run (${header.at}, ${header.head.slice(0, 7)}) than the one recorded (${run.at}); a contract:run is recording it, or stopped before it could`,
          "stale",
        );
      else
        fail(
          `evidence ${run.evidence_path} changed after it was recorded`,
          "tampered",
        );
      continue;
    }
    if (run.exit !== 0) {
      fail(`PASS recorded with exit ${run.exit}`, "tampered");
      continue;
    }
    if (criterion.evidence === "test" || criterion.evidence === "check") {
      if (run.command !== criterion.command) {
        fail(
          `recorded command "${run.command}" is not the contract's "${criterion.command}"`,
          "tampered",
        );
        continue;
      }
      if (criterion.evidence === "test" && !run.tests) {
        fail("PASS recorded with zero tests", "tampered");
        continue;
      }
    }
    if (isReview(criterion)) {
      if (!run.contract_sha256 || !run.as_built_sha256 || !run.runner) {
        fail("a review PASS not written by yarn review:run (B1)", "tampered");
        continue;
      }
      if (
        run.runner.startsWith("fixture") &&
        process.env[FIXTURE_ENV] !== "1"
      ) {
        fail(
          `reviewed by a fixture runner (${run.runner}), not Claude`,
          "tampered",
        );
        continue;
      }
      // A review binds the code it read (the planned-paths rule below) and
      // the frozen criteria, never the prose around them: a build note or an
      // as-built wording fix does not cost a second review (PR-15).
    }
    state.deferred = run.deferred === true;
    if (!merged && !frozen && head) {
      if (!isAncestor(run.head, head)) {
        fail(
          `recorded on ${run.head.slice(0, 7)}, which is not in this branch`,
          "stale",
        );
        continue;
      }
      const changed = changedAfter(
        run.head,
        contract?.planned_paths ?? [],
        specsRoot,
      );
      if (changed.length > 0) {
        fail(
          `${changed.slice(0, 3).join(", ")}${changed.length > 3 ? ` and ${changed.length - 3} more` : ""} changed after it was recorded`,
          "stale",
        );
        continue;
      }
    }
    state.status = "PASS";
  }

  const left = criteria.filter((c) => c.status !== "PASS");
  const nonReviewLeft = left.filter((c) => !c.id.startsWith("review:"));
  let stage: ItemState["stage"];
  if (!results) stage = "draft";
  else if (hasAsBuilt) {
    if (left.length > 0) stage = "closing";
    else {
      const applied = parseAsBuilt(readRepoText(asBuiltPath(item))).applied;
      stage = applied === "pending" ? "migration pending" : "closed";
    }
  } else stage = nonReviewLeft.length === 0 ? "proven" : "open";
  return { item, contract, results, criteria, hasAsBuilt, merged, stage };
}

/** Recorded state only, no git: what the generated _status.md shows, so it never drifts with HEAD. */
export function recordedLeft(state: ItemState): string[] {
  if (!state.contract || !state.results) return [];
  return state.contract.criteria
    .filter((c) => state.results!.criteria[c.id]?.status !== "PASS")
    .map((c) => `${c.id} ${c.evidence}`);
}

function recordedStage(state: ItemState): string {
  if (!state.results) return "draft";
  const left = recordedLeft(state);
  if (state.hasAsBuilt) {
    if (left.length > 0) return "closing";
    return parseAsBuilt(readRepoText(asBuiltPath(state.item))).applied ===
      "pending"
      ? "code complete, migration pending"
      : "closed";
  }
  return left.length === 0 ? "proven" : "open";
}

/** The generated view of every item (E-26). Deterministic: it reads files, never git or the clock. */
export function renderStatusFile(tree: SpecsTree): string {
  const states = tree.items.map((item) => readItemState(item, tree.specsRoot));
  const rows = states.map((state) => {
    const left = recordedLeft(state);
    return `| ${state.item.id} | ${state.item.kind} | ${recordedStage(state)} | ${left.length ? left.join(", ") : "none"} | [\`${state.item.slug}\`](${path.posix.relative(tree.specsRoot, state.item.dir)}/) |`;
  });
  const operatorRows = states.flatMap((state) =>
    (state.contract?.criteria ?? [])
      .filter((c) => state.results?.criteria[c.id]?.run?.deferred === true)
      .map(
        (c) =>
          `| ${state.item.id} | ${c.id} | ${c.statement.replaceAll("|", "\\|")} | \`${state.results!.criteria[c.id]!.run!.evidence_path}\` |`,
      ),
  );
  const epicRows = tree.epics.map((epic) => {
    const tickets = tree.items.filter(
      (item) => item.epic?.prefix === epic.prefix,
    );
    return `| ${epic.prefix} | ${epic.app} | ${tickets.length} | [\`${epic.slug}\`](${path.posix.relative(tree.specsRoot, epic.dir)}/) |`;
  });
  return [
    "# Status",
    "",
    "Generated by `yarn status` from every contract and results file. Do not edit: `check-specs` fails when this is out of date. Live state, with staleness against the code, is `yarn status <id>`.",
    "",
    "## Items",
    "",
    "| ID | Kind | Stage | Left | Folder |",
    "| --- | --- | --- | --- | --- |",
    ...(rows.length ? rows : ["| none | | | | |"]),
    "",
    "## Operator checks",
    "",
    "What only a person can check. None of it holds a ticket. Once checked, tell any thread, which records it: `yarn contract:record <id> <criterion> --evidence <path>`.",
    "",
    "| ID | Criterion | What to check | How |",
    "| --- | --- | --- | --- |",
    ...(operatorRows.length ? operatorRows : ["| none | | | |"]),
    "",
    "## Epics",
    "",
    "| Epic | App | Tickets | Folder |",
    "| --- | --- | --- | --- |",
    ...(epicRows.length ? epicRows : ["| none | | | |"]),
    "",
  ].join("\n");
}

/** Cited files that hold an open decision: listed by status, blocking only with the BLOCKING marker (A6). */
export function openDecisions(contract: Contract): {
  blocking: string[];
  open: string[];
} {
  const blocking: string[] = [];
  const open: string[] = [];
  for (const cited of contract.cites.filter(isCitedFile)) {
    if (!fileExists(cited)) continue;
    const text = readRepoText(cited);
    if (text.includes(BLOCKING_MARKER)) blocking.push(cited);
    else if (text.includes(OPEN_MARKER)) open.push(cited);
  }
  return { blocking, open };
}

// ---------------------------------------------------------------- writes

/** Regenerates _status.md; every script that changes a contract or a result calls it. */
export function refreshStatusFile(toolkit: Toolkit): string {
  const tree = readSpecsTree(toolkit);
  const rel = statusPath(tree.specsRoot);
  mkdirSync(abs(tree.specsRoot), { recursive: true });
  writeFileSync(abs(rel), renderStatusFile(tree));
  return rel;
}

export function writeRepoText(rel: string, text: string) {
  mkdirSync(path.dirname(abs(rel)), { recursive: true });
  writeFileSync(abs(rel), text);
}

// ---------------------------------------------------------------- contract rules

/**
 * The contract rules no schema can carry (A5, A7, A11, A13.2). Each problem
 * names the file and the fix. `started` is false for a draft, which may still
 * hold [FILL] markers and has no reviewers yet.
 */
export function checkContract(
  item: Item,
  file: ContractFile,
  toolkit: Toolkit,
  options: { started: boolean; testChanges?: boolean; specsRoot?: string },
): string[] {
  const rel = contractPath(item);
  // A draft still being filled is work in progress, not a defect.
  if (!options.started && /\[FILL/.test(file.text)) return [];
  const problems = [...file.problems];
  const contract = file.contract;
  if (!contract) return problems;
  const bad = (text: string) => problems.push(`${rel}: ${text}`);

  if (/\[FILL/.test(file.text)) {
    if (options.started) bad("still holds [FILL] markers; fill every one");
    return problems;
  }
  if (contract.id !== item.id)
    bad(
      `id is ${contract.id}, but the folder is ${item.id}; ids are allocated by contract:init`,
    );
  const tokens = estimateTokens(file.text);
  if (tokens > CONTRACT_TOKEN_CAP)
    bad(
      `is about ${tokens} tokens, over the ${CONTRACT_TOKEN_CAP} cap (A5); split the ticket`,
    );
  if (contract.non_negotiables.length > MAX_NON_NEGOTIABLES)
    bad(
      `has ${contract.non_negotiables.length} non-negotiables; at most ${MAX_NON_NEGOTIABLES}, or split the ticket`,
    );
  if (contract.size === "large")
    bad(
      "is sized large (over two days); split it into tickets of under half a day",
    );

  const surfaces = contract.cites.filter(isCitedFile);
  if (surfaces.length > 1 && !contract.waiver)
    bad(
      `cites ${surfaces.length} surface files; a ticket cites one (A5): split it, or add a waiver: line with the reason`,
    );
  for (const cited of surfaces)
    if (!fileExists(cited)) bad(`cites ${cited}, which does not exist`);
  const citedText = surfaces.filter(fileExists).map(readRepoText).join("\n");
  if (surfaces.length > 0)
    for (const id of contract.cites.filter((entry) => !isCitedFile(entry)))
      if (!citedText.includes(id))
        bad(
          `cites ${id}, which no cited file holds; cite the file that defines it`,
        );

  if (/docs\/research\//.test(file.text))
    bad(
      "names a docs/research/ path; research is never attached to a build thread (A11). Cite the distilled file instead",
    );

  if (Array.isArray(contract.truth_files)) {
    const specsRoot = options.specsRoot ?? toolkit.specsRoot;
    const roots = [`${specsRoot}/${item.app}/ux/`, `${specsRoot}/_shared/ux/`];
    for (const truth of contract.truth_files)
      if (!roots.some((root) => truth.startsWith(root)))
        bad(
          `truth file ${truth} is not under ${roots[0]}; truth files are the app's living UX (A8)`,
        );
  }

  const ids = new Set<string>();
  for (const criterion of contract.criteria) {
    const at = `criterion ${criterion.id}`;
    if (ids.has(criterion.id)) bad(`${at} appears twice`);
    ids.add(criterion.id);
    if (criterion.evidence === "test" || criterion.evidence === "check") {
      if (!criterion.command)
        bad(`${at} (${criterion.evidence}) needs a command`);
      else {
        const problem = checkCommand(criterion.command);
        if (problem) bad(`${at}: ${problem}`);
      }
    }
    if (criterion.evidence === "capture" && !criterion.path)
      bad(`${at} (capture) needs the path its evidence will be written to`);
    if (criterion.evidence === "manual" && !criterion.reason)
      bad(`${at} (manual) needs a reason: why no script can prove it`);
    if (isReview(criterion) && criterion.evidence !== "manual")
      bad(`${at} is a review, so its evidence type is manual`);
  }
  if (contract.criteria.filter((c) => !isReview(c)).length === 0)
    bad("has no criteria; every ticket proves at least one thing");

  if (!options.started) return problems;

  const listed = new Set(contract.reviewers);
  for (const role of listed) {
    if (!ids.has(`review:${role}`))
      bad(
        `lists the reviewer ${role} but has no review:${role} criterion; run yarn contract:add ${item.id} review:${role}`,
      );
    if (!findRoleFile(role))
      bad(
        `lists the reviewer ${role}, which has no role file under docs/roles/`,
      );
  }
  for (const id of ids)
    if (id.startsWith("review:") && !listed.has(reviewRole(id)))
      bad(`has ${id} but does not list ${reviewRole(id)} under reviewers`);
  const required = requiredReviewers(contract, item, toolkit, {
    testChanges: options.testChanges,
  });
  for (const [role, why] of required)
    if (!listed.has(role))
      bad(
        `needs the reviewer ${role} (${why[0]}); run yarn contract:add ${item.id} review:${role}`,
      );
  return problems;
}
