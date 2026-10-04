/**
 * No server-only value reaches a browser bundle (D-STK-4, STK-4).
 *
 *   yarn check-client-bundle
 *       Builds apps/web with every server-only variable set to a unique
 *       sentinel, then fails if any sentinel appears in what the browser
 *       receives: a client chunk (.next/static) or a prerendered page or RSC
 *       payload (.next/server/app). Fails when there is nothing to plant.
 *   yarn check-client-bundle --plan [--root <dir>]
 *       Prints the names a build would plant, and any drift, without building.
 *   yarn check-client-bundle --scan <dir> --sentinel NAME=value [...]
 *       Scans an existing client-chunk folder for the given sentinels only.
 *
 * Server-only means every name in .env.example or in the root turbo.json's
 * declared env (globalEnv and each task's env; pass-through lists hold system
 * variables such as TMPDIR) without the NEXT_PUBLIC_ prefix, except the values that
 * cannot carry a sentinel because they are enum words, not secrets: the tier
 * switch and the ones the platform sets. Both files are read, so a secret
 * listed in only one is still planted; a name turbo.json lists and
 * .env.example does not is printed as drift (codebase-conventions §5 asks for
 * both).
 * Either mode fails when a folder is missing or no client chunk is found: a
 * scan of nothing proves nothing.
 */

import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { REPO_ROOT } from "./lib/docs.ts";

const WEB = "apps/web";
const PUBLIC_PREFIX = "NEXT_PUBLIC_";
/** Enum-valued, never secret: a sentinel would fail validation, and the values are public words. */
const UNPLANTABLE = new Set(["NODE_ENV", "DATABASE_ENVIRONMENT", "VERCEL_ENV"]);

function stop(message: string): never {
  console.error(`check-client-bundle — ${message}`);
  process.exit(1);
}

/** Variable names an .env.example declares, commented-out lines included. */
function envFileNames(text: string): string[] {
  const names = new Set<string>();
  for (const line of text.split("\n")) {
    const match = /^\s*#?\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(
      line,
    );
    if (match) names.add(match[1]!);
  }
  return [...names];
}

/** Exact variable names a turbo.json declares (globalEnv, each task's env); wildcards such as `STRIPE_*` are skipped. */
function turboEnvNames(text: string): string[] {
  const turbo = JSON.parse(text) as {
    globalEnv?: string[];
    tasks?: Record<string, { env?: string[] }>;
  };
  const lists = [
    turbo.globalEnv,
    ...Object.values(turbo.tasks ?? {}).map((task) => task.env),
  ];
  return [
    ...new Set(
      lists
        .flatMap((list) => list ?? [])
        .filter((name) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(name)),
    ),
  ];
}

const plantable = (name: string) =>
  !name.startsWith(PUBLIC_PREFIX) && !UNPLANTABLE.has(name);

/** The server-only names to plant, from both registries, and those turbo.json lists that .env.example lacks. */
function plan(root: string): { names: string[]; drift: string[] } {
  const example = path.join(root, ".env.example");
  if (!existsSync(example)) stop(".env.example is missing");
  const fromExample = envFileNames(readFileSync(example, "utf8"));
  const turboFile = path.join(root, "turbo.json");
  const fromTurbo = existsSync(turboFile)
    ? turboEnvNames(readFileSync(turboFile, "utf8"))
    : [];
  const names = [...new Set([...fromExample, ...fromTurbo])]
    .filter(plantable)
    .sort();
  const drift = fromTurbo
    .filter((name) => plantable(name) && !fromExample.includes(name))
    .sort();
  return { names, drift };
}

function printDrift(drift: string[]): void {
  if (drift.length)
    console.log(
      `check-client-bundle — warning: turbo.json lists ${drift.join(", ")}, which .env.example does not; planted anyway. Add each to .env.example with a comment (codebase-conventions §5).`,
    );
}

/** What the browser receives: client chunks, and the pages and RSC payloads Next prerenders. */
type Target = { dir: string; files: RegExp };
const CHUNKS = /\.[cm]?js$/;
const PRERENDERED = /\.(html|rsc)$/;

function listFiles(dir: string, pattern: RegExp): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full, pattern));
    else if (pattern.test(entry.name)) out.push(full);
  }
  return out;
}

/** Fails, naming each variable and file, when a sentinel is in browser-facing output. */
function scan(targets: Target[], sentinels: Map<string, string>): void {
  const files: string[] = [];
  for (const { dir, files: pattern } of targets) {
    const abs = path.resolve(REPO_ROOT, dir);
    if (!existsSync(abs) || !statSync(abs).isDirectory())
      stop(`no build output at ${dir}; build the app first`);
    files.push(...listFiles(abs, pattern));
  }
  if (!files.some((file) => CHUNKS.test(file)))
    stop(
      `no client chunks under ${targets.map((t) => t.dir).join(", ")}; build the app first`,
    );
  const leaks: string[] = [];
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const [name, value] of sentinels)
      if (text.includes(value))
        leaks.push(`${name} in ${path.relative(REPO_ROOT, file)}`);
  }
  if (leaks.length)
    stop(
      `server-only values reached the browser bundle:\n  ${leaks.join("\n  ")}`,
    );
  console.log(
    `check-client-bundle — ${sentinels.size} server-only value(s), none in ${files.length} browser-facing file(s) under ${targets.map((t) => t.dir).join(", ")}.`,
  );
}

const args = process.argv.slice(2);
const scanAt = args.indexOf("--scan");

if (args.includes("--plan")) {
  const rootAt = args.indexOf("--root");
  const root = rootAt === -1 ? REPO_ROOT : path.resolve(args[rootAt + 1] ?? "");
  const { names, drift } = plan(root);
  console.log(`check-client-bundle — would plant: ${names.join(", ")}`);
  printDrift(drift);
} else if (scanAt !== -1) {
  const dir = args[scanAt + 1];
  if (!dir || dir.startsWith("--")) stop("--scan needs a folder");
  const sentinels = new Map<string, string>();
  args.forEach((arg, i) => {
    if (arg !== "--sentinel") return;
    const pair = args[i + 1] ?? "";
    const eq = pair.indexOf("=");
    if (eq < 1) stop(`--sentinel needs NAME=value, not "${pair}"`);
    sentinels.set(pair.slice(0, eq), pair.slice(eq + 1));
  });
  if (sentinels.size === 0) stop("name at least one --sentinel NAME=value");
  scan([{ dir, files: CHUNKS }], sentinels);
} else {
  const { names, drift } = plan(REPO_ROOT);
  if (names.length === 0)
    stop(
      ".env.example and turbo.json list no server-only variable to plant; the check would prove nothing",
    );
  printDrift(drift);
  const sentinels = new Map(
    names.map((name) => [
      name,
      `pem-sentinel-${name.toLowerCase()}-${randomBytes(8).toString("hex")}`,
    ]),
  );
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    ...Object.fromEntries(sentinels),
  };
  delete env.VERCEL_ENV;
  env.DATABASE_ENVIRONMENT = "local";
  const build = spawnSync("yarn", ["workspace", "web", "build"], {
    cwd: REPO_ROOT,
    env,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (build.status !== 0)
    stop(
      `the sentinel build of ${WEB} failed (exit ${build.status}):\n${(build.stdout + build.stderr).trim().split("\n").slice(-15).join("\n")}`,
    );
  scan(
    [
      { dir: `${WEB}/.next/static`, files: CHUNKS },
      { dir: `${WEB}/.next/server/app`, files: PRERENDERED },
    ],
    sentinels,
  );
}
