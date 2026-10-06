/**
 * The record of actions (S12c, D-LAB-28): one row per team action, naming
 * the team member who acted, the action, the experiment and counts. It never
 * names a reviewer: a reviewer viewer is refused, `targetEmail` is a team
 * member's (role changes only), and counts take only the closed names in the
 * schema. An action that changes data passes its transaction as `db`, so the
 * row lands with the change or not at all.
 */

import {
  SANDBOX_ACTION_COUNT_NAMES,
  sandboxActions,
  type SandboxActionCounts,
} from "../schema/sandbox/actions.ts";
import {
  SANDBOX_SLUG_MAX,
  SANDBOX_SLUG_PATTERN,
} from "../schema/sandbox/columns.ts";
import {
  requireTeam,
  SandboxAccessError,
  type SandboxDb,
  type Viewer,
} from "./viewer.ts";

/** A kebab-case name, as `erase-email` or `role-change`: never free text. */
const ACTION_NAME = /^[a-z]+(-[a-z]+)*$/;
const SLUG = new RegExp(SANDBOX_SLUG_PATTERN);

export const ACTION_INPUT_INVALID = "The action record is not valid.";

export type RecordActionInput = {
  action: string;
  slug?: string;
  /** Role changes only: the team member's email, never a reviewer's. */
  targetEmail?: string;
  counts?: SandboxActionCounts;
};

export async function recordAction(
  db: SandboxDb,
  viewer: Viewer,
  input: RecordActionInput,
): Promise<void> {
  const team = requireTeam(viewer);
  if (typeof input.action !== "string" || !ACTION_NAME.test(input.action))
    throw new SandboxAccessError(ACTION_INPUT_INVALID);
  if (
    input.slug !== undefined &&
    (typeof input.slug !== "string" ||
      input.slug.length > SANDBOX_SLUG_MAX ||
      !SLUG.test(input.slug))
  )
    throw new SandboxAccessError(ACTION_INPUT_INVALID);
  if (input.counts !== undefined) {
    const names: readonly string[] = SANDBOX_ACTION_COUNT_NAMES;
    for (const [name, count] of Object.entries(input.counts ?? {}))
      if (!names.includes(name) || !Number.isInteger(count) || count! < 0)
        throw new SandboxAccessError(ACTION_INPUT_INVALID);
  }
  await db.insert(sandboxActions).values({
    actorUserId: team.userId,
    actorEmail: team.email,
    action: input.action,
    slug: input.slug ?? null,
    targetEmail: input.targetEmail ?? null,
    counts: input.counts ?? null,
  });
}
