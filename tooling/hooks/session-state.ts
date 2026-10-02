/**
 * What session-start records and stop-gate reads: a fingerprint of the
 * working tree per session, kept in the OS temp folder (hooks run outside the
 * sandbox), never in the repo. Node built-ins only, so the hooks start fast.
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const DIR = path.join(tmpdir(), "pem-hook-sessions");
const fileFor = (session: string) =>
  path.join(DIR, `${session.replace(/[^A-Za-z0-9_-]/g, "")}.json`);

/** HEAD plus every uncommitted change, hashed: equal fingerprints mean nothing changed. */
export function treeFingerprint(root: string): string {
  const git = (args: string[]) => {
    try {
      return execFileSync("git", args, {
        cwd: root,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
        maxBuffer: 64 * 1024 * 1024,
      });
    } catch {
      return "";
    }
  };
  return createHash("sha256")
    .update(git(["rev-parse", "HEAD"]))
    .update(git(["status", "--porcelain=v1", "-uall"]))
    .update(git(["diff", "HEAD"]))
    .digest("hex");
}

export function saveSnapshot(session: string, fingerprint: string) {
  mkdirSync(DIR, { recursive: true });
  writeFileSync(fileFor(session), JSON.stringify({ fingerprint }));
}

export function readSnapshot(session: string): string | null {
  try {
    return (
      JSON.parse(readFileSync(fileFor(session), "utf8")) as {
        fingerprint: string;
      }
    ).fingerprint;
  } catch {
    return null;
  }
}
