/**
 * The sandbox's one `?state=` reader (canon C-P08, data-contract.md). Each
 * key says who it renders for:
 *
 * - `anyone`: gate keys, which hold no data, so the gate stays one face for
 *   every visitor.
 * - `team`: every other sandbox key, on synthetic fixtures, for a signed-in
 *   developer or admin only.
 *
 * A key refused to this viewer, or one not registered, reads as absent, so
 * the page renders its real state and the refusal leaves no trace.
 *
 * Ships with no surface keys. Each surface ticket registers its own: the gate
 * (LAB-7) as `anyone`, every other surface as `team`.
 */

export type SandboxStateAudience = "anyone" | "team";

/** Who is looking: an admitted reviewer, a visitor not yet past the gate, or the team. */
export type SandboxViewerKind = "reviewer" | "guest" | "team";

export const SANDBOX_STATE_KEYS: Readonly<
  Record<string, SandboxStateAudience>
> = {
  // The gate (LAB-7, gate.md): anyone, on synthetic fixtures.
  "gate-empty": "anyone",
  "gate-loading": "anyone",
  "gate-error": "anyone",
  "gate-partial": "anyone",
  "gate-offline": "anyone",
  "gate-success": "anyone",
  "gate-throttled": "anyone",
  "gate-revoked": "anyone",
  "gate-signed-in": "anyone",
  "gate-server-error": "anyone",
  // The /admin shell (LAB-8, shell.md).
  "shell-admin": "team",
  "shell-developer": "team",
  "shell-not-ready": "team",
  "shell-collapsed": "team",
  "shell-phone": "team",
  "shell-not-found": "team",
  // People (LAB-9, people.md).
  "people-empty": "team",
  "people-loading": "team",
  "people-error": "team",
  "people-partial": "team",
  "people-offline": "team",
  "people-success": "team",
  "people-filter-empty": "team",
  "people-last-admin": "team",
  "people-change-error": "team",
  // Experiments (LAB-10, experiments.md).
  "expts-empty": "team",
  "expts-loading": "team",
  "expts-error": "team",
  "expts-partial": "team",
  "expts-offline": "team",
  "expts-success": "team",
  "expts-stale": "team",
  "expts-developer": "team",
  "expts-header-stale": "team",
  "expts-header-developer": "team",
  "expts-header-partial": "team",
  // Access codes (LAB-15, access-codes.md).
  "codes-empty": "team",
  "codes-loading": "team",
  "codes-error": "team",
  "codes-partial": "team",
  "codes-offline": "team",
  "codes-success": "team",
  "codes-shown-once": "team",
  "codes-copied": "team",
  "codes-make-error": "team",
  "codes-closed": "team",
  "codes-mismatch": "team",
  // The experiment page (LAB-11, experiment.md).
  "exp-empty": "team",
  "exp-loading": "team",
  "exp-error": "team",
  "exp-partial": "team",
  "exp-offline": "team",
  "exp-success": "team",
  "exp-single": "team",
  "exp-returning": "team",
  "exp-sent": "team",
  "exp-closed": "team",
  "exp-revoked": "team",
  // Pins (LAB-12, pins.md).
  "pins-empty": "team",
  "comment-mode": "team",
  composing: "team",
  "pins-loading": "team",
  "pins-error": "team",
  "pins-partial": "team",
  "pins-offline": "team",
  "pins-success": "team",
  "too-long": "team",
  // Data (LAB-16, data.md).
  "data-tab-empty": "team",
  "data-tab-loading": "team",
  "data-tab-error": "team",
  "data-tab-partial": "team",
  "data-tab-offline": "team",
  "data-tab-deleted": "team",
  "data-tab-developer": "team",
  "data-tab-action-error": "team",
  "data-page-loading": "team",
  "data-page-error": "team",
  "data-page-offline": "team",
  "data-page-no-match": "team",
  "data-page-erase-found": "team",
  "data-page-reviewer": "team",
  "data-page-erased": "team",
  "data-page-action-error": "team",
  "data-page-record-empty": "team",
  "data-page-success": "team",
};

/**
 * The `?state=` key this viewer may render, or null. `raw` is the search
 * param as Next hands it; a repeated param is refused, like an unknown key.
 */
export function readSandboxState(
  raw: string | string[] | undefined,
  viewerKind: SandboxViewerKind,
  keys: Readonly<Record<string, SandboxStateAudience>> = SANDBOX_STATE_KEYS,
): string | null {
  if (typeof raw !== "string" || !Object.hasOwn(keys, raw)) return null;
  const audience = keys[raw];
  if (audience === "anyone") return raw;
  if (audience === "team" && viewerKind === "team") return raw;
  return null;
}
