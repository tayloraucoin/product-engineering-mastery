/**
 * How far a repo is from the practice: the distance report a migration's
 * interview opens with (MIG T1, T8; specs/_shared/epics/MIG-codebase-migration/technical/assess.md).
 *
 *   yarn migrate:assess <target>          the markdown report
 *   yarn migrate:assess <target> --json   the same data, as assess.md's data contract
 *   yarn migrate:assess <target> --check --protected <branch>         the preconditions, before any write (T4)
 *   yarn migrate:assess <target> --check --end --protected <branch>   the end set, before the last commit
 *
 * --check exits 1 with every failed precondition and its fix, 0 when all
 * hold; with --json it prints the whole data contract, preconditions filled.
 *
 * Seventeen signals in four groups, each scored 0, 1 or 2 with its evidence, a
 * total, the gate and the path (near, middle or far). It reads the target's
 * tracked files and never writes under it.
 *
 * Node built-ins only, here and in tooling/lib/assess/, so it also runs as
 * `node <toolkit>/tooling/migrate-assess.ts <target>` from a cold session in
 * the target, before anything is installed.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

import { NotARepo, openRepo } from "./lib/assess/repo.ts";
import {
  assessRepo,
  renderMarkdown,
  renderPreconditions,
} from "./lib/assess/report.ts";

const TOOLKIT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const USAGE =
  "usage: yarn migrate:assess <target> [--json] [--check [--end] --protected <branch>]";

const args = process.argv.slice(2);
const FLAGS = new Set(["--json", "--check", "--end"]);
let protectedBranch: string | null = null;
const protectedAt = args.indexOf("--protected");
if (protectedAt !== -1) {
  const value = args[protectedAt + 1];
  if (value === undefined || value.startsWith("--")) {
    console.error(`--protected needs a branch name\n${USAGE}`);
    process.exit(2);
  }
  protectedBranch = value;
  args.splice(protectedAt, 2);
}
const json = args.includes("--json");
const check = args.includes("--check");
const end = args.includes("--end");
const unknown = args.filter((a) => a.startsWith("--") && !FLAGS.has(a));
const positional = args.filter((a) => !a.startsWith("--"));

if (unknown.length || positional.length !== 1) {
  console.error(
    unknown.length ? `unknown flag: ${unknown.join(" ")}\n${USAGE}` : USAGE,
  );
  process.exit(2);
}
if ((end || protectedBranch !== null) && !check) {
  console.error(`--end and --protected go with --check\n${USAGE}`);
  process.exit(2);
}

// yarn runs scripts from the toolkit root, so under yarn a relative target is
// the caller's (INIT_CWD); under plain node it is the shell's, whatever an
// earlier yarn left in the environment.
const target = path.resolve(
  (process.env.npm_lifecycle_event && process.env.INIT_CWD) || process.cwd(),
  positional[0] ?? ".",
);

try {
  const data = assessRepo(
    openRepo(target),
    TOOLKIT,
    check ? { protectedBranch, end } : null,
  );
  process.stdout.write(
    json
      ? `${JSON.stringify(data, null, 2)}\n`
      : check
        ? renderPreconditions(data.preconditions)
        : renderMarkdown(data),
  );
  if (check && data.preconditions.some((p) => !p.ok)) process.exit(1);
} catch (error) {
  if (!(error instanceof NotARepo)) throw error;
  console.error(`migrate:assess: ${error.message}`);
  process.exit(2);
}
