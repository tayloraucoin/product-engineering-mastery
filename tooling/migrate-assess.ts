/**
 * How far a repo is from the practice: the distance report a migration's
 * interview opens with (MIG T1, T8; specs/_shared/epics/MIG-codebase-migration/technical/assess.md).
 *
 *   yarn migrate:assess <target>          the markdown report
 *   yarn migrate:assess <target> --json   the same data, as assess.md's data contract
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
import { assessRepo, renderMarkdown } from "./lib/assess/report.ts";

const TOOLKIT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const USAGE = "usage: yarn migrate:assess <target> [--json]";

const args = process.argv.slice(2);
const json = args.includes("--json");
const unknown = args.filter((a) => a.startsWith("--") && a !== "--json");
const positional = args.filter((a) => !a.startsWith("--"));

if (unknown.length || positional.length !== 1) {
  console.error(
    unknown.length ? `unknown flag: ${unknown.join(" ")}\n${USAGE}` : USAGE,
  );
  process.exit(2);
}

// yarn runs scripts from the toolkit root; a relative target is the caller's.
const target = path.resolve(
  process.env.INIT_CWD ?? process.cwd(),
  positional[0] ?? ".",
);

try {
  const data = assessRepo(openRepo(target), TOOLKIT);
  process.stdout.write(
    json ? `${JSON.stringify(data, null, 2)}\n` : renderMarkdown(data),
  );
} catch (error) {
  if (!(error instanceof NotARepo)) throw error;
  console.error(`migrate:assess: ${error.message}`);
  process.exit(2);
}
