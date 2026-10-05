/**
 * A fake ServiceContext for this package's tests: no database, a scripted
 * one. Its db runs each callback against drizzle's pg-proxy driver, whose
 * answer the test decides: the rows a row-level-security policy would leave
 * visible, or the error Postgres raises when a policy refuses a write. The
 * policies themselves are proven against the real image in @pem/db (STK-9 C1).
 */

import { drizzle } from "drizzle-orm/pg-proxy";

import type { RlsTransaction } from "@pem/db/rls";

import type { ServiceContext } from "./context.ts";

export const USER_ID = "00000000-0000-4000-8000-000000000001";
export const NOTE_ID = "00000000-0000-4000-8000-0000000000aa";

export type Call = { sql: string; params: unknown[] };

/** Postgres's error when a policy refuses a write, as postgres.js reports it. */
export function policyRefusal(): Error {
  return Object.assign(
    new Error('new row violates row-level security policy for table "notes"'),
    { code: "42501" },
  );
}

/**
 * A context whose every query is answered by `answer`: an array of positional
 * rows, or an error to throw.
 */
export function fakeContext(
  answer: (call: Call) => unknown[][] | Error,
): ServiceContext & { calls: Call[] } {
  const calls: Call[] = [];
  const tx = drizzle(async (sql, params) => {
    const call = { sql, params };
    calls.push(call);
    const result = answer(call);
    if (result instanceof Error) throw result;
    return { rows: result };
  });
  return {
    calls,
    userId: USER_ID,
    role: "user",
    db: {
      execute: (callback) => callback(tx as unknown as RlsTransaction),
    },
  };
}
