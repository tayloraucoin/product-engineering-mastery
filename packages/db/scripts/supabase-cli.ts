/**
 * Runs the Supabase CLI, pinned exact in package.json, against this package's
 * supabase/config.toml. Shared by `db:local` (Mode A) and `db:local:full`
 * (Mode B). Both need Docker, and both refuse while STK-9's old container
 * holds the database port.
 */

import { execFileSync, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

import { cliEnvironment } from "./env.ts";
import {
  LEGACY_CONTAINER,
  LOCAL_IMAGE_URL,
  LOCAL_PORT,
} from "./local-image.ts";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function stop(command: string, message: string): never {
  console.error(`${command} — ${message}`);
  process.exit(1);
}

/** Exits with a clear line when Docker is down or the old container holds the port. */
export function preflight(command: string): void {
  // The probe's stderr is dropped: with the daemon down, some Docker CLIs panic
  // on the format template and bury the one line that says what to do.
  try {
    execFileSync("docker", ["info", "--format", "{{.ServerVersion}}"], {
      stdio: "ignore",
    });
  } catch {
    stop(
      command,
      `Docker is not running; start it (macOS: open -a Docker), then rerun yarn ${command}.`,
    );
  }
  if (isContainerRunning(LEGACY_CONTAINER)) {
    stop(
      command,
      `container ${LEGACY_CONTAINER} (the pre-CLI local database) holds port ${LOCAL_PORT}; remove it with docker rm -f ${LEGACY_CONTAINER} and rerun.`,
    );
  }
}

/** Whether a container with exactly this name is running. */
export function isContainerRunning(name: string): boolean {
  return (
    execFileSync(
      "docker",
      ["ps", "--filter", `name=^${name}$`, "--format", "{{.Names}}"],
      { encoding: "utf8" },
    ).trim() !== ""
  );
}

/** Whether a container publishes `port` on every interface rather than loopback only. */
export function isPublishedBeyondLoopback(
  container: string,
  port: number,
): boolean {
  const lines = execFileSync("docker", ["port", container, String(port)], {
    encoding: "utf8",
  })
    .trim()
    .split("\n");
  return lines.some(
    (line) => line.startsWith("0.0.0.0:") || line.startsWith("[::]:"),
  );
}

/** Runs `supabase <args> --workdir packages/db`, streaming its output; exits on failure. */
export function supabase(
  command: string,
  args: string[],
  overrides: Record<string, string> = {},
): void {
  const result = spawnSync("supabase", [...args, "--workdir", packageRoot], {
    stdio: "inherit",
    env: cliEnvironment(overrides),
  });
  if (result.error) {
    stop(
      command,
      `could not run the Supabase CLI (${result.error.message}); run yarn install.`,
    );
  }
  if (result.status !== 0) {
    stop(command, `supabase ${args.join(" ")} exited ${result.status}.`);
  }
}

/** Waits until the local database accepts connections, up to 120 s. */
export async function waitForDatabase(command: string): Promise<void> {
  const deadline = Date.now() + 120_000;
  for (;;) {
    const client = postgres(LOCAL_IMAGE_URL, {
      max: 1,
      connect_timeout: 2,
      onnotice: () => {},
    });
    try {
      await client`select 1`;
      await client.end();
      return;
    } catch (error) {
      await client.end({ timeout: 0 });
      if (Date.now() > deadline) {
        stop(
          command,
          `the database did not accept connections in 120 s: ${String(error)}`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}
