/**
 * Who a sandbox request is (door 3, D-LAB-30, technical/gate.md "Request
 * path"), pure. access.ts binds it to the request; this file reads no cookie,
 * no session and no env, so it runs under `node --test`.
 *
 * `resolveViewerWith` keeps the order the gate's safety rests on:
 *
 *   1. `getTeamMember()` (LAB-2): a developer or admin is the team, without
 *      reading the cookie. The team on an unknown slug is not found.
 *   2. Everyone else: an unknown slug is the gate, with no database call.
 *   3. The `sandbox_access` cookie is verified (signature, slug, age), still
 *      with no database call; missing or bad is the gate.
 *   4. Only then `checkAccess` (LAB-3): code live, version current, and a
 *      signed-in reviewer's access used by that same user.
 *   5. The registry says open or closed: closed with live access is ended.
 *
 * An unknown slug, a wrong code, a revoked code and a closed experiment
 * without live access all come out as the gate (S12b).
 */

import {
  createAccess,
  findLiveReviewerByCodeHash,
  type ReviewerViewer,
  type SandboxDb,
  type TeamViewer,
} from "@pem/db/sandbox";

import {
  findExperiment,
  type ExperimentConfig,
} from "../../../app/experimental/_experiments/registry.ts";
import { hashCode, normaliseCode } from "./code.ts";
import { verifyAccessCookie } from "./cookie.ts";
import type { TeamMember } from "./team-check.ts";

export type ViewerResult =
  | { kind: "team"; viewer: TeamViewer; experiment: ExperimentConfig }
  | { kind: "reviewer"; viewer: ReviewerViewer; experiment: ExperimentConfig }
  | { kind: "ended"; viewer: ReviewerViewer; experiment: ExperimentConfig }
  | { kind: "gate" }
  | { kind: "not-found" };

export type ResolveViewerDeps = {
  getTeamMember(): Promise<TeamMember | null>;
  findExperiment(slug: string): ExperimentConfig | null;
  /**
   * Every `sandbox_access` value on this request. Per-slug paths mean one,
   * but a cookie planted at a broader path could shadow the real one, so the
   * first that verifies wins.
   */
  readAccessCookies(): readonly string[];
  /** SANDBOX_SECRET; unset, no cookie verifies and every reviewer path is the gate. */
  secret: string | null | undefined;
  now: Date;
  /** The signed-in user's id, for an access made signed in (S8); null when signed out. */
  getUserId(): Promise<string | null>;
  /** LAB-3's `checkAccess`, bound to the database. */
  checkAccess(input: {
    accessId: string;
    slug: string;
    userId: string | null;
  }): Promise<{ reviewerId: string; accessId: string } | null>;
};

const GATE: ViewerResult = { kind: "gate" };

export async function resolveViewerWith(
  deps: ResolveViewerDeps,
  slug: string,
): Promise<ViewerResult> {
  const team = await deps.getTeamMember();
  const experiment = deps.findExperiment(slug);
  if (team) {
    if (!experiment) return { kind: "not-found" };
    return {
      kind: "team",
      viewer: { kind: "team", ...team },
      experiment,
    };
  }
  if (!experiment) return GATE;

  const cookie = deps
    .readAccessCookies()
    .map((value) =>
      verifyAccessCookie(deps.secret, value, { slug, now: deps.now }),
    )
    .find((verified) => verified !== null);
  if (!cookie) return GATE;

  const access = await deps.checkAccess({
    accessId: cookie.accessId,
    slug,
    userId: await deps.getUserId(),
  });
  if (!access) return GATE;

  const viewer: ReviewerViewer = {
    kind: "reviewer",
    slug,
    reviewerId: access.reviewerId,
    accessId: access.accessId,
  };
  return experiment.closedOn === null
    ? { kind: "reviewer", viewer, experiment }
    : { kind: "ended", viewer, experiment };
}

/** Who entered the code: the typed email, or a signed-in reviewer's user id (S8). */
export type GateIdentity = { email: string } | { userId: string };

export type GrantAccessInput = {
  slug: string;
  code: string;
  identity: GateIdentity;
};

export type GrantAccessDeps = {
  findExperiment(slug: string): ExperimentConfig | null;
  findLiveReviewerByCodeHash(input: {
    slug: string;
    codeHash: Uint8Array;
  }): Promise<{ reviewerId: string; codeVersion: number } | null>;
  createAccess(
    input:
      | { reviewerId: string; codeVersion: number; email: string }
      | { reviewerId: string; codeVersion: number; userId: string },
  ): Promise<{ accessId: string } | null>;
};

/**
 * One gate entry: the new access's id, or null for a wrong code. An unknown
 * slug or a code that does not normalise is null with no database call; a
 * live code on a closed experiment is granted, so the ended page shows. The
 * email is stored trimmed and lower-cased. LAB-7's action calls this inside
 * LAB-6's throttle and then sets the cookie.
 */
export async function grantAccessWith(
  deps: GrantAccessDeps,
  input: GrantAccessInput,
): Promise<{ accessId: string } | null> {
  if (!deps.findExperiment(input.slug)) return null;
  const code = normaliseCode(input.code);
  if (code === null) return null;
  const reviewer = await deps.findLiveReviewerByCodeHash({
    slug: input.slug,
    codeHash: hashCode(code),
  });
  if (!reviewer) return null;
  const identity =
    "email" in input.identity
      ? { email: input.identity.email.trim().toLowerCase() }
      : { userId: input.identity.userId };
  return deps.createAccess({ ...reviewer, ...identity });
}

/** `grantAccessWith` on the database and the registry. */
export function grantAccess(
  db: SandboxDb,
  input: GrantAccessInput,
): Promise<{ accessId: string } | null> {
  return grantAccessWith(
    {
      findExperiment,
      findLiveReviewerByCodeHash: (i) => findLiveReviewerByCodeHash(db, i),
      createAccess: (i) => createAccess(db, i),
    },
    input,
  );
}
