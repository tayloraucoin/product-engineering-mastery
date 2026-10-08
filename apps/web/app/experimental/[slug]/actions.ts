"use server";

/**
 * The experiment's actions. The gate's (LAB-7): `enterGate` binds the request to
 * `enterGateWith` (lib/sandbox/gate/gate.ts): env's secret, the throttle's
 * cookie and address, the signed-in account, and the database. Neither the
 * code nor the email is logged or put in a URL; the form learns only which
 * state to show.
 */
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { signOut } from "@pem/auth/session";
import { createLogger } from "@pem/observability/logger";

import { deployed, productionRuntime } from "../../../env";
import type { QueueEntry } from "../../../lib/sandbox/client/queue";
import type { SendReviewResult } from "../../../lib/sandbox/client/review-send";
import type {
  CommentResult,
  ListCommentsResult,
} from "../../../lib/sandbox/experiment/comments";
import {
  deleteCommentFor,
  listCommentsFor,
  saveCommentFor,
} from "../../../lib/sandbox/experiment/comments-data";
import {
  recordViewWith,
  viewDepsFor,
  type RecordViewResult,
} from "../../../lib/sandbox/experiment/experiment";
import type {
  ListRepliesResult,
  ListThreadResult,
  ReplyResult,
} from "../../../lib/sandbox/experiment/threads";
import {
  deleteReplyFor,
  listRepliesFor,
  listThreadFor,
  saveReplyFor,
} from "../../../lib/sandbox/experiment/threads-data";
import {
  enterGateWith,
  gatePath,
  type GateActionState,
} from "../../../lib/sandbox/gate/gate";
import {
  bindGateThrottle,
  GATE_COOKIE,
  gateCookieOptions,
  networkKeyOf,
  newBrowserId,
  readBrowserId,
  throttleKeys,
  withGateThrottle,
} from "../../../lib/sandbox/gate/throttle";
import { sendReviewFor } from "../../../lib/sandbox/review/review-data";
import {
  grantAccess,
  resolveViewer,
  sandboxDb,
  sandboxSecret,
  setAccessCookie,
} from "../../../lib/sandbox/shared/access";
import { teamMemberOf } from "../../../lib/sandbox/shared/team";
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

/**
 * One page load or design switch (LAB-11, S15), sent by the switcher after
 * mount, never during render. Only a reviewer on an open experiment is
 * counted; the team and a closed experiment write nothing (D-LAB-14). The
 * result says only which of those happened.
 */
export async function recordView(
  slug: string,
  input: { kind: "load" | "switch"; design: string },
): Promise<RecordViewResult> {
  const result = await recordViewWith(
    { resolveViewer, recordViewEvent: viewDepsFor(sandboxDb) },
    slug,
    input,
  );
  if (result.kind === "failed") log.warn("sandbox.view_failed");
  return result;
}

/**
 * The pins (LAB-12, pins.md): load the reviewer's own, save one under its
 * browser-minted id, delete one. Each validates, resolves the viewer, makes
 * one call and returns a fixed result (lib/sandbox/experiment/comments.ts).
 */
export async function listMyComments(
  slug: string,
): Promise<ListCommentsResult> {
  return listCommentsFor(slug);
}

export async function saveComment(
  slug: string,
  input: QueueEntry,
): Promise<CommentResult> {
  return saveCommentFor(slug, input);
}

export async function deleteComment(
  slug: string,
  input: { id: string },
): Promise<CommentResult> {
  return deleteCommentFor(slug, input);
}

/**
 * The threads (LAB-25, threads.md, beat 2): every thread the viewer may read
 * on the slug, the replies under one root when its pin opens, a reply saved
 * under its browser-minted id, and one's own reply deleted. The mode comes
 * from the registry by slug, never from here; each validates, resolves the
 * viewer, makes one call and returns a fixed result (lib/sandbox/experiment/threads.ts).
 */
export async function listThread(slug: string): Promise<ListThreadResult> {
  return listThreadFor(slug);
}

export async function listReplies(
  slug: string,
  input: { rootId: string },
): Promise<ListRepliesResult> {
  return listRepliesFor(slug, input);
}

export async function saveReply(
  slug: string,
  input: {
    id: string;
    parentId: string;
    body: string;
    clientCreatedAt: string;
  },
): Promise<ReplyResult> {
  return saveReplyFor(slug, input);
}

export async function deleteReply(
  slug: string,
  input: { id: string },
): Promise<ReplyResult> {
  return deleteReplyFor(slug, input);
}

/**
 * The closing review's send (LAB-17, review.md): the browser has flushed its
 * queued pins first; this judges and stores one numbered version and returns
 * a fixed result (lib/sandbox/review/review.ts). The team stores nothing (S18).
 */
export async function sendReview(
  slug: string,
  input: unknown,
): Promise<SendReviewResult> {
  return sendReviewFor(slug, input);
}
