/**
 * `yarn db:local`: starts the local Supabase image on 127.0.0.1 and waits
 * until it accepts connections. Reuses the container when it exists. Needs
 * Docker running. Stop it with `docker stop pem-db-local`.
 */

import { execFileSync } from "node:child_process";
import postgres from "postgres";

import {
  LOCAL_CONTAINER,
  LOCAL_IMAGE,
  LOCAL_IMAGE_URL,
  LOCAL_PORT,
} from "./local-image.ts";

function docker(args: string[]): string {
  return execFileSync("docker", args, { encoding: "utf8" }).trim();
}

// The probe's stderr is dropped: with the daemon down, some Docker CLIs panic
// on the format template and bury the one line that says what to do.
try {
  execFileSync("docker", ["info", "--format", "{{.ServerVersion}}"], {
    stdio: "ignore",
  });
} catch {
  console.error(
    "db:local — Docker is not running; start it (macOS: open -a Docker), then rerun yarn db:local.",
  );
  process.exit(1);
}

const existing = docker([
  "ps",
  "--all",
  "--filter",
  `name=^${LOCAL_CONTAINER}$`,
  "--format",
  "{{.Image}}",
]);

if (existing === "") {
  console.log(`db:local — starting ${LOCAL_IMAGE} on 127.0.0.1:${LOCAL_PORT}`);
  docker([
    "run",
    "--detach",
    "--name",
    LOCAL_CONTAINER,
    "--publish",
    `127.0.0.1:${LOCAL_PORT}:5432`,
    "--env",
    "POSTGRES_PASSWORD=postgres",
    LOCAL_IMAGE,
  ]);
} else if (existing !== LOCAL_IMAGE) {
  console.error(
    `db:local — container ${LOCAL_CONTAINER} runs ${existing}, not ${LOCAL_IMAGE}; remove it with docker rm -f ${LOCAL_CONTAINER} and rerun.`,
  );
  process.exit(1);
} else {
  docker(["start", LOCAL_CONTAINER]);
}

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
    break;
  } catch (error) {
    await client.end({ timeout: 0 });
    if (Date.now() > deadline) {
      console.error(
        `db:local — the image did not accept connections in 120 s: ${String(error)}`,
      );
      process.exit(1);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

console.log(
  `db:local — ready at 127.0.0.1:${LOCAL_PORT}; next: yarn db:migrate && yarn db:setup`,
);
