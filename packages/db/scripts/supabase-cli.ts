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

import type { Tier } from "@pem/env/tier";

import { isLoopbackHost } from "../src/loopback.ts";
import { ADD_RECIPE, cliEnvironment, requireTier } from "./env.ts";
import {
  LEGACY_CONTAINER,
  LOCAL_CONTAINER,
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

/**
 * Exits with one line, before any `docker` call or connection, unless the
 * tier is local. `needs` says which local database the command wants: the
 * Docker one (`db:local`, `db:local:full`, which start it), or any local one
 * (your own Postgres after `yarn db:setup:local`, or Docker's).
 */
export function requireLocalTier(
  command: string,
  needs: "docker" | "any" = "docker",
): void {
  const what =
    needs === "docker"
      ? "needs the local database (Docker)"
      : `needs a local database (your own Postgres after yarn db:setup:local, or Docker's after ${ADD_RECIPE})`;
  let tier: Tier;
  try {
    tier = requireTier();
  } catch (error) {
    stop(
      command,
      `${what}, and ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  if (tier !== "local") {
    stop(
      command,
      needs === "docker"
        ? `${what}, and DATABASE_ENVIRONMENT is ${tier}. Docker is not the default; to use it, follow ${ADD_RECIPE}.`
        : `${what}, and DATABASE_ENVIRONMENT is ${tier}.`,
    );
  }
}

/** Exits with a clear line when the tier is not local, Docker is down, or the old container holds the port. */
export function preflight(command: string): void {
  requireLocalTier(command);
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

/**
 * The addresses in `docker port` output that are not loopback: `0.0.0.0` and
 * `::` (every interface) or a specific LAN address the daemon binds to.
 */
export function nonLoopbackBindings(dockerPortOutput: string): string[] {
  return dockerPortOutput
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "")
    .map((line) => line.slice(0, line.lastIndexOf(":")))
    .filter((host) => !isLoopbackHost(host));
}

/** Whether a container publishes `port` anywhere but loopback; false when Docker cannot say. */
export function isPublishedBeyondLoopback(
  container: string,
  port: number,
): boolean {
  try {
    const output = execFileSync("docker", ["port", container, String(port)], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return nonLoopbackBindings(output).length > 0;
  } catch {
    return false;
  }
}

/** Prints the network-exposure warning when the database port is not loopback-only. */
export function warnIfExposed(command: string): void {
  if (isPublishedBeyondLoopback(LOCAL_CONTAINER, 5432)) {
    console.warn(
      `${command} — the database port ${LOCAL_PORT} is reachable from your network, password postgres, and it may hold mirrored staging emails. On a shared network, set "ip": "127.0.0.1" in Docker's daemon settings, then yarn db:stop and rerun.`,
    );
  }
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
