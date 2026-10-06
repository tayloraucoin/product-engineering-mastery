/**
 * Mode A's mirror (D-STK-6), handed to the request seam. It runs only when the
 * code runs on a developer's machine (not a deployment), the tier is local and
 * the auth URL is hosted: sign-in happens on staging, so the local database
 * has no auth.users row for the user until the mirror writes one. In Mode B
 * the auth URL is loopback, local Auth owns auth.users, and there is no mirror.
 *
 * @pem/db's own guards still stand behind this: a loopback client, and an
 * INSERT that refuses wherever Supabase Auth has created auth.identities.
 */

import "server-only";

import type { Mirror } from "@pem/auth/context";
import { getDb } from "@pem/db/client";
import { applyLocalAuthMirror, isLoopbackUrl } from "@pem/db/local-auth-mirror";
import { createLogger } from "@pem/observability/logger";

import { deployed, env } from "../../env";
import { supabaseConfig } from "./config";

const log = createLogger("auth");

/** Postgres's unique violation: a re-created staging user whose email a stale local row still holds. */
const UNIQUE_VIOLATION = "23505";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: unknown }).code === UNIQUE_VIOLATION
  );
}

/** The mirror for this process, or undefined when Mode A does not apply. */
export function localAuthMirror(): Mirror | undefined {
  if (deployed || env.DATABASE_ENVIRONMENT !== "local" || !supabaseConfig)
    return undefined;
  if (isLoopbackUrl(supabaseConfig.url)) return undefined;
  const url = env.DATABASE_URL;
  if (!url) {
    log.warn("auth.mirror_unconfigured", {
      reason:
        "DATABASE_URL_LOCAL is unset, so signed-in staging users are not copied into the local database",
    });
    return undefined;
  }

  return async (user) => {
    try {
      const outcome = await applyLocalAuthMirror(
        getDb({ url, tier: "local" }).$client,
        user,
      );
      return outcome === "refused" ? "refused" : "settled";
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
      // Retrying cannot help until the stale row goes, so the request is served and the seam moves on.
      log.warn("auth.mirror_email_taken", {
        userId: user.id,
        reason:
          "a local auth.users row holds this email under another id; delete it, or run yarn db:local:reset",
      });
      return "settled";
    }
  };
}
