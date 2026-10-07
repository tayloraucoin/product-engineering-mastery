/**
 * Guards the reviewer map against dead rows (MIG-4; T6, Risk 6).
 *
 *   yarn check-reviewers
 *
 * Under the overlay tiers, fails when a reviewer row in toolkit.json matches
 * no tracked file, by its glob or by its imports list: a row that reaches
 * nothing seats nobody, so a change it was written for ships at a lower QA
 * level unnoticed. The fix is to correct the row or delete it. At `starter`
 * it is skipped, because a starter's rows are seats for modules not built
 * yet (the legal and consent rows, here).
 *
 * Reads tracked files only (`git ls-files`), and of those opens source files
 * only, through the matcher suggestReviewers uses (tooling/lib/specs.ts).
 */

import { REPO_ROOT } from "./lib/docs.ts";
import { runGit } from "./lib/git.ts";
import { findRowReach, readImportedModules } from "./lib/specs.ts";
import { loadToolkit, type ToolkitReviewer } from "./lib/toolkit.ts";

const toolkit = loadToolkit();

if (toolkit.tier === "starter") {
  console.log(
    "check-reviewers — skipped at tier starter: a starter's rows are seats for modules not built yet.",
  );
  process.exit(0);
}

const listed = runGit(["ls-files"], REPO_ROOT);
if (listed === null) {
  console.error(
    "check-reviewers — git ls-files failed; run it from a git checkout.",
  );
  process.exit(1);
}
const tracked = listed.split("\n").filter(Boolean);

/** A row as the operator wrote it, so the failure names the line to fix. */
const describe = (row: ToolkitReviewer, i: number) =>
  `reviewers[${i}] (${[
    row.glob && `glob ${row.glob}`,
    row.imports && `imports ${row.imports.join(", ")}`,
    `role ${row.role}`,
  ]
    .filter(Boolean)
    .join("; ")})`;

const dead = toolkit.reviewers
  .map((row, i) => ({ row, i }))
  .filter(
    ({ row }) =>
      !tracked.some(
        (file) =>
          findRowReach(
            row,
            file,
            row.imports ? readImportedModules(file, REPO_ROOT) : [],
          ) !== null,
      ),
  );

if (dead.length > 0) {
  console.error(
    `check-reviewers — ${dead.length} reviewer row(s) match no tracked file at tier ${toolkit.tier}; correct each or delete it from toolkit.json:\n${dead
      .map(({ row, i }) => `  ${describe(row, i)}`)
      .join("\n")}`,
  );
  process.exit(1);
}

console.log(
  `check-reviewers — ${toolkit.reviewers.length} reviewer rows, each matching at least one of ${tracked.length} tracked files.`,
);
