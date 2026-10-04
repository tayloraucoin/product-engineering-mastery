/**
 * Which Supabase pooler each connection uses (D-STK-5). Runtime queries go
 * through the transaction pooler (port 6543), where prepared statements break,
 * so the client turns them off. Migrations, setup SQL and other session-scoped
 * work go through the session pooler (port 5432). The local tier talks to the
 * local image directly and is not checked. Pure: callers hand in the URL.
 */

import type { Tier } from "@pem/env/tier";

export type ConnectionUse = "runtime" | "migration";

/** The pooler port each use requires on a hosted tier. */
export const POOLER_PORT: Record<ConnectionUse, string> = {
  runtime: "6543",
  migration: "5432",
};

const POOLER_NAME: Record<ConnectionUse, string> = {
  runtime: "transaction pooler",
  migration: "session pooler",
};

/** Host, port and database of a connection URL, never its credentials. */
export function describeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const database = parsed.pathname.replace(/^\//, "") || "postgres";
    return `${parsed.hostname}:${parsed.port || "5432"}/${database}`;
  } catch {
    return "an unparseable URL";
  }
}

/**
 * Returns `url` when it suits `use` on `tier`; throws otherwise. On staging and
 * production a runtime URL must be the transaction pooler and a migration URL
 * the session pooler.
 */
export function assertPooler(
  url: string,
  use: ConnectionUse,
  tier: Tier,
): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`The ${use} database URL is not a valid URL.`);
  }
  if (!/^postgres(ql)?:$/.test(parsed.protocol)) {
    throw new Error(`The ${use} database URL must start with postgresql://.`);
  }
  if (tier === "local") return url;
  const port = parsed.port || "5432";
  if (port !== POOLER_PORT[use]) {
    throw new Error(
      `The ${use} database URL for ${tier} points at ${describeUrl(url)}; use the Supabase ${POOLER_NAME[use]} (port ${POOLER_PORT[use]}).`,
    );
  }
  return url;
}
