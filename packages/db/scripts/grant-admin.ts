/**
 * `yarn workspace @pem/db db:grant-admin <email>`: makes an existing account
 * an admin through the Supabase Auth admin API (LAB-9, S2). The first admin
 * of a project is set this way, once; after that People grants roles. It also
 * restores an admin after the accepted last-admin race (placement.md).
 *
 * - The account must exist: sign in once first. An unknown email is refused
 *   with a fixed message that does not echo it.
 * - Idempotent: an admin already is left untouched.
 * - Only `app_metadata.role` changes; every other key is written back as read.
 * - Every request refuses redirects (`redirect: "error"`): one could carry the
 *   service-role key off to another host. The key is never printed.
 *
 * It writes outside People's role-change lock, which is safe only because it
 * never removes a role: it cannot bring the admins to zero. A script that
 * removes one must take the lock.
 *
 * It lives in @pem/db, beside `local-users.ts`, because `admin` predates the
 * sandbox: removing that stack entry keeps this script (LAB-24's runbook).
 */

import { fileURLToPath } from "node:url";

import { authSettings, authUrlName } from "./env.ts";

export type GrantOutcome = "granted" | "already-admin";

export type GrantOptions = {
  email: string | undefined;
  /** The auth URL for this tier: NEXT_PUBLIC_SUPABASE_URL and its suffixes. */
  authUrl: string | undefined;
  serviceRoleKey: string | undefined;
  /** The variable that held the URL, for the refusal message. */
  authUrlName: string;
  fetch?: typeof fetch;
};

export const GRANT_ADMIN_ERRORS = {
  usage: "usage: yarn workspace @pem/db db:grant-admin <email>",
  unknown:
    "no account has that email. Sign in once with it, then run this again.",
  key: "SUPABASE_SERVICE_ROLE_KEY for this tier is unset; see .env.example.",
} as const;

const PER_PAGE = 1000;
const MAX_PAGES = 50;

type AuthUser = {
  id: string;
  email?: string | null;
  app_metadata?: Record<string, unknown> | null;
};

export async function grantAdmin({
  email,
  authUrl,
  serviceRoleKey,
  authUrlName: urlName,
  fetch: send = fetch,
}: GrantOptions): Promise<GrantOutcome> {
  const wanted = email?.trim().toLowerCase();
  if (!wanted || !wanted.includes("@"))
    throw new Error(GRANT_ADMIN_ERRORS.usage);
  if (!authUrl) throw new Error(`${urlName} is unset; see .env.example.`);
  if (!serviceRoleKey) throw new Error(GRANT_ADMIN_ERRORS.key);

  const headers: Record<string, string> = {
    apikey: serviceRoleKey,
    "content-type": "application/json",
  };
  // A legacy service-role key is a JWT and goes in Authorization too; a new
  // sb_secret_ key is accepted in apikey alone.
  if (serviceRoleKey.split(".").length === 3)
    headers.authorization = `Bearer ${serviceRoleKey}`;

  const call = async (path: string, init: RequestInit = {}) => {
    const response = await send(new URL(path, authUrl), {
      ...init,
      headers,
      redirect: "error",
    });
    if (!response.ok)
      throw new Error(
        `the Auth admin API answered ${response.status} to ${init.method ?? "GET"} ${path.split("?")[0]}`,
      );
    return response.json() as Promise<unknown>;
  };

  let user: AuthUser | undefined;
  for (let page = 1; page <= MAX_PAGES && !user; page++) {
    const body = (await call(
      `/auth/v1/admin/users?page=${page}&per_page=${PER_PAGE}`,
    )) as { users?: AuthUser[] };
    const users = body.users ?? [];
    user = users.find((u) => u.email?.trim().toLowerCase() === wanted);
    if (users.length < PER_PAGE) break;
  }
  if (!user) throw new Error(GRANT_ADMIN_ERRORS.unknown);

  const appMetadata = { ...(user.app_metadata ?? {}) };
  if (appMetadata.role === "admin") return "already-admin";
  await call(`/auth/v1/admin/users/${encodeURIComponent(user.id)}`, {
    method: "PUT",
    body: JSON.stringify({ app_metadata: { ...appMetadata, role: "admin" } }),
  });
  return "granted";
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const { url, serviceRoleKey } = authSettings();
    const outcome = await grantAdmin({
      email: process.argv[2],
      authUrl: url,
      serviceRoleKey,
      authUrlName: authUrlName(),
    });
    console.log(
      outcome === "granted"
        ? "db:grant-admin — that account is now an admin. It takes effect the next time they open a page."
        : "db:grant-admin — that account is already an admin; nothing changed.",
    );
  } catch (error) {
    console.error(
      `db:grant-admin — ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
}
