/** `yarn web:capture [--surface <id>]`: runs the capture project, passing the filter by env. */
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const i = args.indexOf("--surface");
const surface = i >= 0 ? args[i + 1] : undefined;
if (i >= 0 && !surface) {
  console.error("capture: --surface needs a surface id");
  process.exit(2);
}
const rest = i >= 0 ? args.filter((_, j) => j !== i && j !== i + 1) : args;
const run = spawnSync(
  "playwright",
  ["test", "--project=capture", "--reporter=list", ...rest],
  { stdio: "inherit", env: { ...process.env, CAPTURE_SURFACE: surface ?? "" } },
);
process.exit(run.status ?? 1);
