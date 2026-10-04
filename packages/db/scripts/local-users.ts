/**
 * The synthetic users `yarn db:seed-users` creates in Mode B (D-STK-6), through
 * the local Supabase Auth admin API, so Auth itself writes auth.users and the
 * setup triggers create public.users. Mode A has no local auth server: its
 * users arrive through the mirror when they sign in on staging, so a seed
 * there would land on the hosted project. The seed therefore refuses any auth
 * URL that is not loopback, before sending anything.
 */

import { isLoopbackUrl } from "../src/local-auth-mirror.ts";

/** Synthetic accounts; the password is a local test value, never a real one. */
export const LOCAL_USERS = [
  { email: "alice@example.test", password: "local-password-alice" },
  { email: "bob@example.test", password: "local-password-bob" },
] as const;

export type SeedOutcome = { email: string; result: "created" | "exists" };

export type SeedOptions = {
  /** The auth URL for this tier: NEXT_PUBLIC_SUPABASE_URL and its suffixes. */
  authUrl: string | undefined;
  serviceRoleKey: string | undefined;
  /** The variable that held the URL, for the refusal message. */
  authUrlName: string;
  fetch?: typeof fetch;
};

/** Creates each synthetic user once; an existing email is left as it is. */
export async function seedLocalUsers({
  authUrl,
  serviceRoleKey,
  authUrlName,
  fetch: send = fetch,
}: SeedOptions): Promise<SeedOutcome[]> {
  if (!authUrl || !isLoopbackUrl(authUrl)) {
    throw new Error(
      `db:seed-users seeds only a local auth server (Mode B); ${authUrlName} is ${authUrl ? "not loopback" : "unset"}. In Mode A, sign in on staging and the mirror copies the user.`,
    );
  }
  if (!serviceRoleKey) {
    throw new Error(
      "db:seed-users needs SUPABASE_SERVICE_ROLE_KEY_LOCAL: the service-role key `supabase status` prints.",
    );
  }

  const endpoint = new URL("/auth/v1/admin/users", authUrl);
  const headers: Record<string, string> = {
    apikey: serviceRoleKey,
    "content-type": "application/json",
  };
  // A legacy service-role key is a JWT and goes in Authorization too; a new
  // sb_secret_ key is accepted in apikey alone.
  if (serviceRoleKey.split(".").length === 3) {
    headers.authorization = `Bearer ${serviceRoleKey}`;
  }

  const outcomes: SeedOutcome[] = [];
  for (const user of LOCAL_USERS) {
    const response = await send(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        email: user.email,
        password: user.password,
        email_confirm: true,
      }),
    });
    if (response.ok) {
      outcomes.push({ email: user.email, result: "created" });
      continue;
    }
    const body = await response.text();
    if (response.status === 422 && body.includes("email_exists")) {
      outcomes.push({ email: user.email, result: "exists" });
      continue;
    }
    throw new Error(
      `db:seed-users — creating ${user.email} failed: ${response.status} ${body.slice(0, 200)}`,
    );
  }
  return outcomes;
}
