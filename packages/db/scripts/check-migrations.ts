/**
 * `yarn check-migrations` (in `yarn verify`): fails when any migration in
 * toolkit.json's `migrationsDir` acts on Supabase's auth schema (D-STK-5).
 * A null `migrationsDir` means the repo has no database module; nothing to check.
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { scanMigrationsDir } from "./auth-ddl.ts";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const toolkit = JSON.parse(
  readFileSync(path.join(repoRoot, "toolkit.json"), "utf8"),
) as { migrationsDir?: string | null };

const dir = toolkit.migrationsDir;
if (!dir) {
  console.log(
    "check-migrations: toolkit.json sets no migrationsDir; nothing to check.",
  );
} else if (!existsSync(path.join(repoRoot, dir))) {
  console.error(`check-migrations: migrationsDir ${dir} does not exist.`);
  process.exitCode = 1;
} else {
  const { files, findings } = scanMigrationsDir(path.join(repoRoot, dir));
  if (findings.length === 0) {
    console.log(
      `check-migrations: ${files} migration(s) in ${dir}, none touch the auth schema.`,
    );
  } else {
    for (const finding of findings) {
      console.error(
        `check-migrations: ${dir}/${finding.file} statement ${finding.statement} acts on the auth schema: ${finding.text.slice(0, 160)}`,
      );
    }
    console.error(
      "Supabase owns auth: point a foreign key at auth.users if you must, and put anything else in packages/db/supabase/setup.",
    );
    process.exitCode = 1;
  }
}
