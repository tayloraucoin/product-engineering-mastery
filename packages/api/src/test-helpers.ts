/**
 * Fakes for this package's tests: Supabase answering `getUser` for a cookie
 * session or an access token, and a ServiceContext whose database is
 * scripted through drizzle's pg-proxy driver, as in @pem/services' tests.
 */

import { drizzle } from "drizzle-orm/pg-proxy";

import {
  createAuthContextResolver,
  type AuthContext,
  type AuthUser,
  type UserReader,
} from "@pem/auth/context";
import type { Logger } from "@pem/observability/logger";
import type { ServiceContext } from "@pem/services/context";

import type { ApiContextSources } from "./context.ts";

export const USER_ID = "00000000-0000-4000-8000-000000000001";
export const NOTE_ID = "00000000-0000-4000-8000-0000000000aa";
export const SESSION_COOKIE = "sb-staging-auth-token=signed-session";
export const ACCESS_TOKEN = "eyJ.access.token";

const silent: Logger = { info() {}, warn() {}, error() {} };

/** What Supabase answers for a genuine session or token. */
export function supabaseUser(role: AuthContext["role"] = "user"): AuthUser {
  return {
    id: USER_ID,
    email: "ana@example.test",
    app_metadata: { role },
  };
}

function reader(user: AuthUser | null): UserReader {
  return {
    auth: {
      async getUser() {
        return user
          ? { data: { user }, error: null }
          : { data: { user: null }, error: new Error("invalid JWT") };
      },
    },
  };
}

/**
 * The sources an app hands the transport, over one request seam: Supabase
 * vouches for the cookie session in `cookie` and for ACCESS_TOKEN, and for
 * nothing else.
 */
export function sources(options: {
  cookie: string | null;
  user?: AuthUser;
  db?: ServiceContext["db"];
}): ApiContextSources & { serviceContexts: ServiceContext[] } {
  const resolve = createAuthContextResolver({ logger: silent });
  const user = options.user ?? supabaseUser();
  const serviceContexts: ServiceContext[] = [];
  return {
    serviceContexts,
    fromCookies: () =>
      resolve(reader(options.cookie === SESSION_COOKIE ? user : null)),
    fromBearer: (token) =>
      resolve(reader(token === ACCESS_TOKEN ? user : null)),
    serviceContextFor: (signedIn) => {
      const context: ServiceContext = {
        userId: signedIn.userId,
        role: signedIn.role,
        db: options.db ?? scriptedDb(() => []),
      };
      serviceContexts.push(context);
      return context;
    },
  };
}

/** A database whose every query is answered by `answer`: positional rows, or an error to throw. */
export function scriptedDb(
  answer: (sql: string) => unknown[][] | Error,
): ServiceContext["db"] {
  const tx = drizzle(async (sql) => {
    const result = answer(sql);
    if (result instanceof Error) throw result;
    return { rows: result };
  });
  return {
    execute: (callback) =>
      callback(tx as unknown as Parameters<typeof callback>[0]),
  };
}

/** Headers carrying the cookie session, or an Authorization header. */
export function headers(entries: Record<string, string>): Headers {
  return new Headers(entries);
}
