"use server";

/**
 * The gate's two actions (LAB-7). `enterGate` binds the request to
 * `enterGateWith` (lib/sandbox/gate.ts): env's secret, the throttle's
 * cookie and address, the signed-in account, and the database. Neither the
 * code nor the email is logged or put in a URL; the form learns only which
 * state to show.
 */
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { signOut } from "@pem/auth/session";
import { createLogger } from "@pem/observability/logger";

import { deployed, productionRuntime } from "../../../env";
import {
  grantAccess,
  sandboxDb,
  sandboxSecret,
  setAccessCookie,
} from "../../../lib/sandbox/access";
import {
  enterGateWith,
  gatePath,
  type GateActionState,
} from "../../../lib/sandbox/gate";
import { teamMemberOf } from "../../../lib/sandbox/team";
import {
  bindGateThrottle,
  GATE_COOKIE,
  gateCookieOptions,
  networkKeyOf,
  newBrowserId,
  readBrowserId,
  throttleKeys,
  withGateThrottle,
} from "../../../lib/sandbox/throttle";
import { supabaseConfig } from "../../../lib/supabase/config";
import { getAuthContext } from "../../../lib/supabase/context";

const log = createLogger("sandbox");

/**
 * Off Vercel the client's address cannot be trusted, so only the browser
 * counter runs. On a production runtime that is worth saying, once per
 * process, without naming any address.
 */
let networkCounterOffNoted = false;
function noteNetworkCounterOff() {
  if (networkCounterOffNoted || !productionRuntime || deployed) return;
  networkCounterOffNoted = true;
  log.warn("sandbox.network_counter_off");
}

export async function enterGate(
  slug: string,
  _previous: GateActionState,
  formData: FormData,
): Promise<GateActionState> {
  const jar = await cookies();
  const auth = await getAuthContext();
  // The team never sees the gate; a signed-in user with an email enters as their account (S8).
  const account =
    auth && !teamMemberOf(auth) && auth.email ? { userId: auth.userId } : null;

  noteNetworkCounterOff();
  const secret = sandboxSecret();
  const existingBrowserId = readBrowserId(jar.get(GATE_COOKIE)?.value);
  const browserId = existingBrowserId ?? newBrowserId();

  const result = await enterGateWith(
    {
      runThrottled: async (attempt) => {
        // Fails closed: no secret, no keys, no try.
        const keys = throttleKeys({
          secret,
          browserId,
          networkKey: networkKeyOf(
            (await headers()).get("x-forwarded-for"),
            deployed,
          ),
        });
        return withGateThrottle(
          bindGateThrottle(sandboxDb()),
          keys,
          new Date(),
          attempt,
        );
      },
      grantAccess: (input) => grantAccess(sandboxDb(), input),
      setAccessCookie: (accessId) => setAccessCookie(slug, accessId),
      markFailedTry: async () => {
        if (!existingBrowserId)
          jar.set(GATE_COOKIE, browserId, gateCookieOptions(productionRuntime));
      },
    },
    {
      slug,
      email: formData.get("email"),
      code: formData.get("code"),
      account,
    },
  );

  switch (result.kind) {
    case "redirect":
      return redirect(result.to);
    case "error":
      return { kind: "error", errors: result.errors };
    case "throttled":
      return {
        kind: "throttled",
        lockedUntil: result.lockedUntil.toISOString(),
      };
    case "server-error":
      log.warn("sandbox.gate_failed");
      return { kind: "server-error" };
  }
}

/** A `?state=` fixture's form: nothing is read, counted or written. */
export async function holdGateFixture(
  previous: GateActionState,
): Promise<GateActionState> {
  return previous;
}

/** A `?state=` fixture's "Sign out": back to the same gate, the session untouched. */
export async function holdSignOutFixture(slug: string): Promise<never> {
  redirect(gatePath(slug));
}

/**
 * The signed-in face's "Sign out" (S8): ends this device's session only
 * (local scope), through @pem/auth's one `signOut`, the function STK-24's
 * route calls, then returns to the same gate.
 */
export async function signOutHere(slug: string): Promise<never> {
  if (supabaseConfig) {
    const jar = await cookies();
    const outcome = await signOut(supabaseConfig, {
      getAll: () => jar.getAll(),
      setAll: (written) => {
        for (const { name, value, options } of written)
          jar.set(name, value, options);
      },
    });
    if (!outcome.revoked)
      log.warn("auth.sign_out_unrevoked", {
        tags: { code: outcome.failure ?? "unknown" },
      });
  }
  redirect(gatePath(slug));
}
