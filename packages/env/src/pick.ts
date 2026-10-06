/**
 * The per-tier picker (codebase-conventions §5; D-STK-3). A tiered variable
 * ends in `_LOCAL` or `_STAGING`; the unsuffixed name is production's, and the
 * fallback for a tier whose own value is absent. Pure: the caller hands it the
 * source, so only an app's env.ts reads process.env.
 */

import type { Tier } from "./tier.ts";

/** A source of raw values, such as the object an app's env.ts builds. */
export type EnvSource = Readonly<Record<string, string | undefined>>;

const SUFFIX: Record<Tier, string> = {
  local: "_LOCAL",
  staging: "_STAGING",
  production: "",
};

/** The variable a tier reads for `name`: `NAME_LOCAL`, `NAME_STAGING` or `NAME`. */
export function tierName(name: string, tier: Tier): string {
  return `${name}${SUFFIX[tier]}`;
}

/** Every form of a tiered variable, unsuffixed first. */
export function tieredNames(name: string): string[] {
  return [name, tierName(name, "local"), tierName(name, "staging")];
}

const present = (value: string | undefined) =>
  value !== undefined && value.trim() !== "" ? value.trim() : undefined;

/**
 * The value of `name` for `tier`: the tier's own variable, else the unsuffixed
 * one, else undefined. Empty strings count as absent.
 */
export function pickTiered(
  source: EnvSource,
  name: string,
  tier: Tier,
): string | undefined {
  return present(source[tierName(name, tier)]) ?? present(source[name]);
}

/** The variable `pickTiered` read for `name` and `tier`, for error messages; undefined when neither is set. */
export function pickedName(
  source: EnvSource,
  name: string,
  tier: Tier,
): string | undefined {
  if (present(source[tierName(name, tier)])) return tierName(name, tier);
  return present(source[name]) ? name : undefined;
}
