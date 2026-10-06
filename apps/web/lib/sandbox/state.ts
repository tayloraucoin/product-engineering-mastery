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
