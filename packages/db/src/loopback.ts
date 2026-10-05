/**
 * Loopback checks for database work that must never leave this machine: the
 * local auth mirror, the local reset, the local marker, the integration tests
 * and the network warning in db:local. Pure; callers hand in the host, URL or
 * client. Kept apart from the mirror so removing the mirror leaves them.
 */

import type postgres from "postgres";

/** Whether `host` names this machine: localhost, 127.0.0.0/8 or ::1. */
export function isLoopbackHost(host: string): boolean {
  const bare = host
    .trim()
    .toLowerCase()
    .replace(/^\[|\]$/g, "");
  return (
    bare === "localhost" ||
    bare === "::1" ||
    /^127(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/.test(bare)
  );
}

/** Whether `url` parses and its host is loopback; an unparseable URL is not. */
export function isLoopbackUrl(url: string): boolean {
  try {
    return isLoopbackHost(new URL(url).hostname);
  } catch {
    return false;
  }
}

/** Throws unless every host the client would connect to is loopback. */
export function assertLoopbackClient(sql: postgres.Sql): void {
  const hosts = sql.options.host;
  const offending = hosts.filter(
    (host) => typeof host !== "string" || !isLoopbackHost(host),
  );
  if (hosts.length === 0 || offending.length > 0) {
    throw new Error(
      `This writes only to a loopback database; the client points at ${hosts.join(", ") || "no host"}. Local-only database work runs on DATABASE_ENVIRONMENT=local against this machine.`,
    );
  }
}
