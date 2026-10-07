/**
 * Access codes in /admin (LAB-15, access-codes.md, D-LAB-23, S3, S6): make a
 * code for one person, replace it, revoke it. Pure behind a deps seam, as
 * billing/webhook/handle.ts: `admin-codes-data.ts` binds the registry, LAB-5's
 * `generateCode` and `hashCode`, the site URL and @pem/db/sandbox; this file
 * holds the rules, so it runs under `node --test`.
 *
 * - The code exists in clear only in a `made` result: it is generated here,
 *   hashed, and only the hash reaches the store. Nothing here logs, records
 *   or keeps it.
 * - On a closed experiment, make and replace are `closed` before the store is
 *   touched; revoke stays open.
 * - The display name is required on a collaborate experiment and stored null
 *   on a private one (D-LAB-16), whatever the form sent.
 * - The caller has passed `requireTeamAction()`; a member who is not a
 *   developer or an admin is refused again here.
 */

import {
  CODE_DISPLAY_NAME_MAX,
  CODE_LABEL_MAX,
  CODES_WORDS,
  experimentLink,
} from "./admin-codes-view.ts";
import { normaliseCode } from "./code.ts";
import type { TeamMember } from "./team-check.ts";

/** What the rules need of an experiment's config. */
export type CodesExperiment = {
  slug: string;
  mode: "private" | "collaborate";
  closedOn: string | null;
};

/** @pem/db/sandbox's code functions, bound to the database and the member. */
export type CodesStore = {
  makeCode(
    member: TeamMember,
    input: {
      slug: string;
      label: string;
      displayName: string | null;
      codeHash: Uint8Array;
    },
  ): Promise<{ reviewerId: string } | { taken: true }>;
  replaceCode(
    member: TeamMember,
    input: { slug: string; reviewerId: string; codeHash: Uint8Array },
  ): Promise<{ codeVersion: number } | { taken: true } | null>;
  revokeCode(
    member: TeamMember,
    input: { slug: string; reviewerId: string },
  ): Promise<{ revoked: true } | null>;
};

export type CodesDeps = {
  /** The registry: an unknown slug never reaches the store. */
  findExperiment(slug: string): CodesExperiment | null;
  /** LAB-5's `generateCode`: 16 Crockford symbols, grouped. */
  generateCode(): string;
  /** LAB-5's `hashCode`, of the normalised symbols. */
  hashCode(normalised: string): Uint8Array;
  /** env's site URL, never the request's host. */
  siteUrl: string;
  store: CodesStore;
};

export type CodeField = "label" | "displayName";

export type CodeActionResult =
  | { outcome: "made"; code: string; link: string }
  | { outcome: "revoked" }
  | { outcome: "closed"; message: string }
  | { outcome: "invalid"; field: CodeField; message: string }
  | { outcome: "failed"; message: string }
  | { outcome: "refused" };

export const CODE_ACTION_REFUSED: CodeActionResult = Object.freeze({
  outcome: "refused",
});

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Hash collisions are 80-bit improbable: one more draw, then `failed`. */
const DRAWS = 2;

const isTeam = (member: TeamMember) =>
  member?.role === "developer" || member?.role === "admin";

const closedResult = (): CodeActionResult => ({
  outcome: "closed",
  message: CODES_WORDS.closed,
});

/** The trimmed label, or the field's refusal. */
export function parseLabel(
  value: unknown,
): { label: string } | Extract<CodeActionResult, { outcome: "invalid" }> {
  const label = typeof value === "string" ? value.trim() : "";
  if (label.length === 0)
    return {
      outcome: "invalid",
      field: "label",
      message: CODES_WORDS.labelEmpty,
    };
  if (label.length > CODE_LABEL_MAX)
    return {
      outcome: "invalid",
      field: "label",
      message: CODES_WORDS.labelTooLong,
    };
  return { label };
}

/** The display name to store: required on collaborate, null on private. */
export function parseDisplayName(
  value: unknown,
  mode: CodesExperiment["mode"],
):
  | { displayName: string | null }
  | Extract<CodeActionResult, { outcome: "invalid" }> {
  if (mode === "private") return { displayName: null };
  const displayName = typeof value === "string" ? value.trim() : "";
  if (displayName.length === 0)
    return {
      outcome: "invalid",
      field: "displayName",
      message: CODES_WORDS.displayNameEmpty,
    };
  if (displayName.length > CODE_DISPLAY_NAME_MAX)
    return {
      outcome: "invalid",
      field: "displayName",
      message: CODES_WORDS.displayNameTooLong,
    };
  return { displayName };
}

/** A fresh code and its hash, or null when the generator gave something that is not a code. */
function draw(deps: CodesDeps): { code: string; codeHash: Uint8Array } | null {
  const code = deps.generateCode();
  const normalised = normaliseCode(code);
  return normalised ? { code, codeHash: deps.hashCode(normalised) } : null;
}

export async function makeCodeWith(
  deps: CodesDeps,
  member: TeamMember,
  input: { slug: unknown; label: unknown; displayName: unknown },
): Promise<CodeActionResult> {
  if (!isTeam(member)) return CODE_ACTION_REFUSED;
  const failed: CodeActionResult = {
    outcome: "failed",
    message: CODES_WORDS.makeFailed,
  };
  const experiment =
    typeof input.slug === "string" ? deps.findExperiment(input.slug) : null;
  if (!experiment) return failed;
  if (experiment.closedOn !== null) return closedResult();
  const label = parseLabel(input.label);
  if ("outcome" in label) return label;
  const displayName = parseDisplayName(input.displayName, experiment.mode);
  if ("outcome" in displayName) return displayName;
  try {
    for (let attempt = 0; attempt < DRAWS; attempt++) {
      const fresh = draw(deps);
      if (!fresh) return failed;
      const made = await deps.store.makeCode(member, {
        slug: experiment.slug,
        label: label.label,
        displayName: displayName.displayName,
        codeHash: fresh.codeHash,
      });
      if ("reviewerId" in made)
        return {
          outcome: "made",
          code: fresh.code,
          link: experimentLink(deps.siteUrl, experiment.slug),
        };
    }
    return failed;
  } catch {
    return failed;
  }
}

export async function replaceCodeWith(
  deps: CodesDeps,
  member: TeamMember,
  input: { slug: unknown; reviewerId: unknown },
): Promise<CodeActionResult> {
  if (!isTeam(member)) return CODE_ACTION_REFUSED;
  const failed: CodeActionResult = {
    outcome: "failed",
    message: CODES_WORDS.replaceFailed,
  };
  const experiment =
    typeof input.slug === "string" ? deps.findExperiment(input.slug) : null;
  if (!experiment) return failed;
  if (experiment.closedOn !== null) return closedResult();
  if (typeof input.reviewerId !== "string" || !UUID.test(input.reviewerId))
    return failed;
  try {
    for (let attempt = 0; attempt < DRAWS; attempt++) {
      const fresh = draw(deps);
      if (!fresh) return failed;
      const replaced = await deps.store.replaceCode(member, {
        slug: experiment.slug,
        reviewerId: input.reviewerId,
        codeHash: fresh.codeHash,
      });
      if (replaced === null) return failed;
      if ("codeVersion" in replaced)
        return {
          outcome: "made",
          code: fresh.code,
          link: experimentLink(deps.siteUrl, experiment.slug),
        };
    }
    return failed;
  } catch {
    return failed;
  }
}

/** Revoke stays open on a closed experiment. */
export async function revokeCodeWith(
  deps: CodesDeps,
  member: TeamMember,
  input: { slug: unknown; reviewerId: unknown },
): Promise<CodeActionResult> {
  if (!isTeam(member)) return CODE_ACTION_REFUSED;
  const failed: CodeActionResult = {
    outcome: "failed",
    message: CODES_WORDS.revokeFailed,
  };
  const experiment =
    typeof input.slug === "string" ? deps.findExperiment(input.slug) : null;
  if (!experiment) return failed;
  if (typeof input.reviewerId !== "string" || !UUID.test(input.reviewerId))
    return failed;
  try {
    const revoked = await deps.store.revokeCode(member, {
      slug: experiment.slug,
      reviewerId: input.reviewerId,
    });
    return revoked ? { outcome: "revoked" } : failed;
  } catch {
    return failed;
  }
}
