/**
 * The sandbox's request seam (door 3, D-LAB-30). Every experiment page,
 * review page and sandbox action calls `resolveViewer(slug)` first. This file
 * binds the pure cores (access-check.ts, cookie.ts, link.ts) to the request:
 * `cookies()`, `getAuthContext()`, the registry, env's SANDBOX_SECRET, site URL
 * and `deployed`, and the database.
 *
 * SANDBOX_SECRET unset: no cookie verifies, no link fills an email, and no
 * cookie can be issued, so every reviewer path fails closed. The team is
 * unaffected. There is no fallback secret.
 */

import "server-only";

import { cookies } from "next/headers";

import { getDb } from "@pem/db/client";
import { checkAccess, findAccessEmail, type SandboxDb } from "@pem/db/sandbox";

import { findExperiment } from "../../app/experimental/_experiments/registry.ts";
import { deployed, env } from "../../env";
import { getAuthContext } from "../supabase/context";
import { resolveViewerWith, type ViewerResult } from "./access-check.ts";
import {
  ACCESS_COOKIE,
  accessCookieOptions as accessCookieOptionsFor,
  signAccessCookie,
} from "./cookie.ts";
import { linkUrlFor, readLinkEmailWith } from "./link.ts";
import { isUsableSecret } from "./secret.ts";
import { getTeamMember } from "./team.ts";

export {
  grantAccess,
  grantAccessWith,
  type GateIdentity,
  type GrantAccessInput,
  type ViewerResult,
} from "./access-check.ts";

/** SANDBOX_SECRET for this tier, or null when unset (env.ts refuses one too short). */
export function sandboxSecret(): string | null {
  return isUsableSecret(env.SANDBOX_SECRET) ? env.SANDBOX_SECRET : null;
}

/** The database the sandbox queries, as the billing ledger binds it. */
export function sandboxDb(): SandboxDb {
  if (!env.DATABASE_URL)
    throw new Error(
      "DATABASE_URL is unset for this tier; the sandbox has no database to read.",
    );
  return getDb({ url: env.DATABASE_URL, tier: env.DATABASE_ENVIRONMENT });
}

/** Who is asking for this slug: team, reviewer, ended, gate or not-found. */
export async function resolveViewer(slug: string): Promise<ViewerResult> {
  const jar = await cookies();
  return resolveViewerWith(
    {
      getTeamMember,
      findExperiment,
      readAccessCookie: () => jar.get(ACCESS_COOKIE)?.value,
      secret: sandboxSecret(),
      now: new Date(),
      getUserId: async () => (await getAuthContext())?.userId ?? null,
      checkAccess: (input) => checkAccess(sandboxDb(), input),
    },
    slug,
  );
}

/** How `sandbox_access` is set for a slug. */
export function accessCookieOptions(slug: string) {
  return accessCookieOptionsFor(slug, deployed);
}

/**
 * Sets `sandbox_access` for one access on its slug, issued now. Call only from
 * a server action; throws when SANDBOX_SECRET is unset, so the action fails
 * before telling anyone they are in.
 */
export async function setAccessCookie(
  slug: string,
  accessId: string,
): Promise<void> {
  const secret = sandboxSecret();
  if (!secret) throw new Error("SANDBOX_SECRET is unset for this tier.");
  const value = signAccessCookie(secret, {
    accessId,
    slug,
    issuedAt: new Date(),
  });
  (await cookies()).set(ACCESS_COOKIE, value, accessCookieOptions(slug));
}

/** The email a `?r=` token prefills on this slug, or null; never grants access. */
export function readLinkEmail(
  db: SandboxDb,
  slug: string,
  token: unknown,
): Promise<string | null> {
  return readLinkEmailWith(
    {
      secret: sandboxSecret(),
      isKnownSlug: (s) => findExperiment(s) !== null,
      findAccessEmail: (input) => findAccessEmail(db, input),
    },
    slug,
    token,
  );
}

/** The confirmation email's link for one access (LAB-20); the origin is env's site URL. */
export function linkUrl(slug: string, accessId: string): string {
  const secret = sandboxSecret();
  if (!secret) throw new Error("SANDBOX_SECRET is unset for this tier.");
  return linkUrlFor(env.NEXT_PUBLIC_SITE_URL, secret, slug, accessId);
}
