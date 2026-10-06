/**
 * The key-mode guard (D-STK-4). A vendor key carries its mode in its prefix;
 * a live key on `local` or `staging`, or a test key on `production`, is a
 * validation error naming the variable. Stripe's prefixes are the first rule;
 * its variables arrive with the billing ticket (STK-16).
 */

import type { Tier } from "./tier.ts";

/** The prefixes that mark a key's mode. */
export type KeyModePrefixes = {
  live: readonly string[];
  test: readonly string[];
};

/** Stripe's secret, publishable and restricted key prefixes. */
export const STRIPE_KEY_PREFIXES: KeyModePrefixes = {
  live: ["sk_live_", "pk_live_", "rk_live_"],
  test: ["sk_test_", "pk_test_", "rk_test_"],
};

/**
 * Why `value`, read from the variable `name`, does not fit `tier`; null when
 * it fits. A key with neither prefix fails too: a mode the guard cannot read
 * is not a mode it can vouch for.
 */
export function keyModeProblem(
  name: string,
  value: string,
  tier: Tier,
  prefixes: KeyModePrefixes = STRIPE_KEY_PREFIXES,
): string | null {
  const live = prefixes.live.some((p) => value.startsWith(p));
  const test = prefixes.test.some((p) => value.startsWith(p));
  if (!live && !test)
    return `${name} has no live or test prefix (${[...prefixes.live, ...prefixes.test].join(", ")}).`;
  if (tier === "production" && test)
    return `${name} is a test-mode key, and DATABASE_ENVIRONMENT is production; set the live key.`;
  if (tier !== "production" && live)
    return `${name} is a live-mode key, and DATABASE_ENVIRONMENT is ${tier}; set a test key.`;
  return null;
}
