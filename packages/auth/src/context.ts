/**
 * The request seam (D-STK-7): the one place a request learns who is asking.
 * It returns the `AuthContext` that the row-level-security bridge
 * (`@pem/db/rls`) and every service take, or null for an anonymous request.
 *
 * The user comes from `getUser()`, which sends the access token to Supabase
 * Auth and returns the user only if the token is genuine and the user still
 * exists. The session in the cookie (`getSession()`) is never read: anyone can
 * write a cookie. When `getUser()` fails for any reason (no session, a forged
 * or revoked token, Auth unreachable), the request is anonymous.
 *
 * The role is `app_metadata.role`, which only the service role can write;
 * `user_metadata` is the user's own to edit and is never read for it.
 *
 * In Mode A (D-STK-6) the app passes `mirror`, which copies the user into the
 * local auth.users. The seam calls it once per user per process: a user whose
 * mirror settled is not mirrored again until the process restarts, or until
 * the user's email changes. A refusal or a failure is not remembered, so the
 * next request tries again.
 */

import "server-only";

import { APP_ROLES, type AppRole } from "@pem/db/rls";
import { createLogger, type Logger } from "@pem/observability/logger";

/** Who is asking: the user's id and email, and the application role the policies read. */
export type AuthContext = {
  userId: string;
  email: string | null;
  role: AppRole;
};

/** The user fields the seam reads from Supabase's `getUser()`. */
export type AuthUser = {
  id: string;
  email?: string | null;
  app_metadata?: Record<string, unknown>;
};

/** The part of a Supabase client the seam calls: `getUser()` and nothing else. */
export type UserReader = {
  auth: {
    getUser(): Promise<{
      data: { user: AuthUser | null };
      error: unknown;
    }>;
  };
};

export type MirrorUser = { id: string; email: string | null };

/**
 * Copies a user into the local database. `settled` means the user's row is in
 * place, or never will be by retrying; `refused` means the database's own
 * guard declined, so the seam tries again on the next request.
 */
export type Mirror = (user: MirrorUser) => Promise<"settled" | "refused">;

export type AuthContextResolver = (
  client: UserReader,
) => Promise<AuthContext | null>;

/** The role in `app_metadata`, when it names a known role; `user` otherwise. */
export function roleOf(user: AuthUser): AppRole {
  const role = user.app_metadata?.role;
  return (APP_ROLES as readonly unknown[]).includes(role)
    ? (role as AppRole)
    : "user";
}

/** A resolver for this process. Create it once, at module scope, so its record of mirrored users lasts the process. */
export function createAuthContextResolver(
  options: { mirror?: Mirror; logger?: Logger } = {},
): AuthContextResolver {
  const log = options.logger ?? createLogger("auth");
  const settled = new Set<string>();
  const inFlight = new Map<string, Promise<void>>();

  async function mirrorOnce(mirror: Mirror, user: MirrorUser): Promise<void> {
    const key = `${user.id}\u0000${user.email ?? ""}`;
    if (settled.has(key)) return;
    let run = inFlight.get(key);
    if (!run) {
      run = mirror(user)
        .then((outcome) => {
          if (outcome === "settled") settled.add(key);
        })
        .catch((error: unknown) => {
          log.warn("auth.mirror_failed", { error, userId: user.id });
        })
        .finally(() => inFlight.delete(key));
      inFlight.set(key, run);
    }
    await run;
  }

  return async function resolveAuthContext(client) {
    let result: Awaited<ReturnType<UserReader["auth"]["getUser"]>>;
    try {
      result = await client.auth.getUser();
    } catch {
      return null;
    }
    const user = result.data?.user;
    if (result.error || !user) return null;

    const context: AuthContext = {
      userId: user.id,
      email: user.email ?? null,
      role: roleOf(user),
    };
    if (options.mirror)
      await mirrorOnce(options.mirror, {
        id: context.userId,
        email: context.email,
      });
    return context;
  };
}
